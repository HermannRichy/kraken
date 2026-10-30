import "server-only";

import { NETWORKS, REGISTRATION_FEE } from "@/config/payment";

import { db } from "./db";
import { sendEmail } from "./email/send";
import { templates } from "./email/templates";
import { getPaymentStatus, PaymentProviderError, requestToPay } from "./feexpay";
import { countTakenSeats, encryptedKeys, getSeatsCap, spaceUrl } from "./participants";
import { pushToUser } from "./push";

const LOCK_SEATS = 4_200_001; // clé du verrou consultatif PostgreSQL pour l'attribution des places
const PENDING_REUSE_MS = 10 * 60_000;

export type StartPaymentResult =
  | { ok: true; paymentId: string; reused?: boolean }
  | { ok: false; error: string; waitlisted?: boolean };

/**
 * Lance le paiement des frais :
 * - réutilise un paiement en attente récent (double clic, rechargement de page : jamais de double débit)
 * - attribue la place sous verrou (pas de survente au-delà du plafond, sinon liste d'attente)
 * - enregistre le paiement AVANT d'appeler FeexPay, avec une clé d'idempotence unique
 */
export async function startPayment(input: {
  userId: string;
  network: string;
  phoneE164: string;
  idempotencyKey: string;
}): Promise<StartPaymentResult> {
  const participant = await db.participant.findUnique({ where: { userId: input.userId } });
  if (!participant) return { ok: false, error: "Inscription introuvable." };
  if (participant.status === "registered") return { ok: false, error: "Votre inscription est déjà réglée." };
  if (participant.status === "pre_registered") return { ok: false, error: "Confirmez d'abord votre adresse e-mail." };
  if (!["email_confirmed", "payment_pending", "waitlisted"].includes(participant.status)) {
    return { ok: false, error: "Le paiement n'est pas disponible pour votre statut." };
  }

  // Même clé d'idempotence : on renvoie le paiement existant.
  const sameKey = await db.payment.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (sameKey) return sameKey.participantId === participant.id ? { ok: true, paymentId: sameKey.id, reused: true } : { ok: false, error: "Requête invalide." };

  // Paiement déjà en attente : on le réutilise au lieu d'en créer un second.
  const pending = await db.payment.findFirst({
    where: { participantId: participant.id, status: "pending", createdAt: { gte: new Date(Date.now() - PENDING_REUSE_MS) } },
    orderBy: { createdAt: "desc" },
  });
  if (pending) return { ok: true, paymentId: pending.id, reused: true };

  const network = NETWORKS.find((n) => n.slug === input.network);
  if (!network) return { ok: false, error: "Réseau non pris en charge." };
  const phoneDigits = input.phoneE164.replace(/\D/g, "");

  // Attribution de la place sous verrou transactionnel.
  const reserved = await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${LOCK_SEATS})`;
    const [cap, taken] = await Promise.all([getSeatsCap(), countTakenSeats(tx)]);
    if (taken >= cap) {
      await tx.participant.update({ where: { id: participant.id }, data: { status: "waitlisted", waitlistedAt: participant.waitlistedAt ?? new Date() } });
      return null;
    }
    const payment = await tx.payment.create({
      data: {
        participantId: participant.id,
        amount: REGISTRATION_FEE,
        network: network.slug,
        phone: phoneDigits,
        idempotencyKey: input.idempotencyKey,
      },
    });
    await tx.participant.update({ where: { id: participant.id }, data: { status: "payment_pending" } });
    return payment;
  });

  if (!reserved) {
    if (participant.status !== "waitlisted") {
      await sendEmail({ to: { email: participant.email, name: participant.fullName }, type: "waitlisted", participantId: participant.id, content: templates.waitlisted({ name: participant.fullName, url: spaceUrl() }) });
    }
    return { ok: false, waitlisted: true, error: "Les places sont toutes prises : vous êtes en liste d'attente." };
  }

  try {
    const res = await requestToPay({
      network: network.slug,
      phone: phoneDigits,
      amount: REGISTRATION_FEE,
      description: "Inscription Kraken : Sold Out",
      callbackInfo: reserved.id,
    });
    await db.payment.update({ where: { id: reserved.id }, data: { providerRef: res.reference, lastCheckedAt: new Date() } });
    return { ok: true, paymentId: reserved.id };
  } catch (error) {
    const message = error instanceof PaymentProviderError ? error.message : "Le paiement n'a pas pu être lancé.";
    await markFailed(reserved.id, message);
    return { ok: false, error: message };
  }
}

async function markFailed(paymentId: string, reason: string) {
  await db.$transaction(async (tx) => {
    const updated = await tx.payment.updateMany({ where: { id: paymentId, status: "pending" }, data: { status: "failed", failureReason: reason.slice(0, 300) } });
    if (updated.count === 0) return;
    const p = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
    await tx.participant.updateMany({ where: { id: p.participantId, status: "payment_pending" }, data: { status: "email_confirmed" } });
  });
}

/**
 * Applique le résultat d'un paiement, de façon idempotente :
 * seul un paiement encore « pending » change d'état, quel que soit le nombre de webhooks reçus.
 */
export async function applyPaymentResult(paymentId: string, status: "SUCCESSFUL" | "FAILED", reason?: string | null) {
  if (status === "FAILED") {
    const before = await db.payment.findUnique({ where: { id: paymentId }, include: { participant: true } });
    if (!before || before.status !== "pending") return { changed: false };
    await markFailed(paymentId, reason || "Paiement refusé ou expiré");
    const p = before.participant;
    await Promise.all([
      sendEmail({ to: { email: p.email, name: p.fullName }, type: "payment_failed", participantId: p.id, content: templates.paymentFailed({ name: p.fullName, reason: reason || "refusé ou expiré", url: spaceUrl() }) }),
      pushToUser(p.userId, { title: "Paiement non abouti", body: "Aucun montant débité. Vous pouvez réessayer depuis votre espace.", url: "/espace", tag: "payment" }),
    ]);
    return { changed: true };
  }

  const result = await db.$transaction(async (tx) => {
    const updated = await tx.payment.updateMany({ where: { id: paymentId, status: "pending" }, data: { status: "succeeded", confirmedAt: new Date() } });
    if (updated.count === 0) return null;
    const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { participant: true } });
    const p = payment.participant;
    await tx.participant.update({
      where: { id: p.id },
      data: { status: "registered", registeredAt: new Date(), ...(p.testKeyEnc ? {} : encryptedKeys()) },
    });
    return payment;
  });
  if (!result) return { changed: false };

  const p = result.participant;
  const net = NETWORKS.find((n) => n.slug === result.network);
  await Promise.all([
    sendEmail({
      to: { email: p.email, name: p.fullName },
      type: "payment_receipt",
      participantId: p.id,
      content: templates.paymentReceipt({
        name: p.fullName,
        amount: result.amount,
        network: net?.label ?? result.network,
        reference: result.providerRef ?? result.id,
        date: new Date().toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo", dateStyle: "long", timeStyle: "short" }),
        url: spaceUrl(),
      }),
    }),
    pushToUser(p.userId, { title: "Place réservée !", body: "Paiement confirmé. Vos clés de test vous attendent dans votre espace.", url: "/espace", tag: "payment" }),
  ]);
  return { changed: true };
}

/**
 * Réconciliation : interroge FeexPay pour un paiement en attente (webhook perdu ou en retard).
 * Le statut FeexPay fait foi ; le montant vient toujours de notre base.
 */
export async function reconcilePayment(paymentId: string, { force = false } = {}) {
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status !== "pending" || !payment.providerRef) return payment?.status ?? null;
  if (!force && payment.lastCheckedAt && Date.now() - payment.lastCheckedAt.getTime() < 5_000) return "pending";

  await db.payment.update({ where: { id: paymentId }, data: { lastCheckedAt: new Date() } });
  try {
    const { status, reason } = await getPaymentStatus(payment.providerRef, payment.phone);
    if (status === "SUCCESSFUL" || status === "FAILED") {
      await applyPaymentResult(paymentId, status, reason);
      return status === "SUCCESSFUL" ? "succeeded" : "failed";
    }
    // Toujours en attente au-delà de 30 min : considéré comme expiré.
    if (Date.now() - payment.createdAt.getTime() > 30 * 60_000) {
      await applyPaymentResult(paymentId, "FAILED", "Délai de confirmation dépassé");
      return "failed";
    }
  } catch (error) {
    console.error("[payments] réconciliation", paymentId, (error as Error).message);
  }
  return "pending";
}
