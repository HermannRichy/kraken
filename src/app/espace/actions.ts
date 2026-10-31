"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { encryptedKeys, readKeys } from "@/lib/server/participants";
import { startPayment, type StartPaymentResult } from "@/lib/server/payments";
import { rateLimit, retryMessage } from "@/lib/server/rate-limit";
import { pushToUser } from "@/lib/server/push";
import { requireParticipant } from "@/lib/server/session";
import { fieldErrors, paymentSchema, toE164, type PaymentInput } from "@/lib/validation";
import { NETWORKS } from "@/config/payment";

export type PayResult = StartPaymentResult & { errors?: Record<string, string> };

/** Lance le paiement Mobile Money des frais d'inscription. */
export async function payAction(input: PaymentInput): Promise<PayResult> {
  const { session } = await requireParticipant();
  const limit = await rateLimit(`pay:${session.user.id}`, 6, 10 * 60);
  if (!limit.ok) return { ok: false, error: retryMessage(limit.retryAfter) };

  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Vérifiez le réseau et le numéro.", errors: fieldErrors(parsed.error) };
  const net = NETWORKS.find((n) => n.slug === parsed.data.network)!;

  const res = await startPayment({
    userId: session.user.id,
    network: net.slug,
    phoneE164: toE164(parsed.data.phone, net.country),
    idempotencyKey: parsed.data.idempotencyKey,
  });
  revalidatePath("/espace", "layout");
  return res;
}

/** Affiche les clés en clair (chaque révélation est consignée). */
export async function revealKeysAction(): Promise<{ ok: true; testKey: string; webhookSecret: string } | { ok: false; error: string }> {
  const { session, participant } = await requireParticipant();
  const limit = await rateLimit(`keys-reveal:${session.user.id}`, 20, 60 * 60);
  if (!limit.ok) return { ok: false, error: retryMessage(limit.retryAfter) };
  const keys = readKeys(participant);
  if (!keys) return { ok: false, error: "Aucune clé émise pour le moment." };
  await audit({ actorId: session.user.id, action: "keys.reveal", targetType: "participant", targetId: participant.id });
  return { ok: true, testKey: keys.testKey, webhookSecret: keys.webhookSecret };
}

/** Révoque les clés actuelles et en émet de nouvelles. */
export async function regenerateKeysAction(confirmation: string): Promise<{ ok: boolean; error?: string }> {
  const { session, participant } = await requireParticipant();
  if (z.literal("RÉGÉNÉRER").safeParse(confirmation.trim().toUpperCase()).success === false) {
    return { ok: false, error: "Tapez RÉGÉNÉRER pour confirmer." };
  }
  if (participant.status !== "registered") return { ok: false, error: "Les clés ne sont disponibles qu'une fois l'inscription réglée." };
  const limit = await rateLimit(`keys-regen:${session.user.id}`, 3, 24 * 60 * 60);
  if (!limit.ok) return { ok: false, error: retryMessage(limit.retryAfter) };

  await db.participant.update({ where: { id: participant.id }, data: encryptedKeys() });
  await audit({ actorId: session.user.id, action: "keys.regenerate", targetType: "participant", targetId: participant.id });
  revalidatePath("/espace", "layout");
  return { ok: true };
}

const subscriptionSchema = z.object({
  endpoint: z.url().max(1000),
  keys: z.object({ p256dh: z.string().min(10).max(200), auth: z.string().min(8).max(100) }),
});

/** Enregistre l'abonnement aux notifications push de cet appareil. */
export async function savePushSubscriptionAction(sub: unknown, userAgent?: string): Promise<{ ok: boolean }> {
  const { session } = await requireParticipant();
  const parsed = subscriptionSchema.safeParse(sub);
  if (!parsed.success) return { ok: false };
  const limit = await rateLimit(`push-sub:${session.user.id}`, 10, 60 * 60);
  if (!limit.ok) return { ok: false };
  await db.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    create: { userId: session.user.id, endpoint: parsed.data.endpoint, p256dh: parsed.data.keys.p256dh, auth: parsed.data.keys.auth, userAgent: userAgent?.slice(0, 300) },
    update: { userId: session.user.id, p256dh: parsed.data.keys.p256dh, auth: parsed.data.keys.auth },
  });
  return { ok: true };
}

/** Désabonne un appareil des notifications push. */
export async function removePushSubscriptionAction(endpoint: string): Promise<{ ok: boolean }> {
  const { session } = await requireParticipant();
  const parsed = z.string().url().max(1000).safeParse(endpoint);
  if (!parsed.success) return { ok: false };
  await db.pushSubscription.deleteMany({ where: { userId: session.user.id, endpoint: parsed.data } });
  return { ok: true };
}

/** Envoie une notification de test à tous les appareils de l'utilisateur. */
export async function sendTestPushAction(): Promise<{ ok: boolean; error?: string }> {
  const { session } = await requireParticipant();
  const limit = await rateLimit(`push-test:${session.user.id}`, 3, 10 * 60);
  if (!limit.ok) return { ok: false, error: retryMessage(limit.retryAfter) };
  const { sent } = await pushToUser(session.user.id, { title: "Kraken : Sold Out", body: "Notifications actives sur cet appareil. On vous préviendra au bon moment.", url: "/espace", tag: "test" });
  return sent > 0 ? { ok: true } : { ok: false, error: "Aucun appareil abonné ou notifications non configurées." };
}
