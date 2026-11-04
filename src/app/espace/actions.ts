"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { isCloudinaryConfigured, uploadPrivateFile } from "@/lib/server/cloudinary";
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
  const { sent } = await pushToUser(session.user.id, { title: "Kraken — édition 01 : Sold Out", body: "Notifications actives sur cet appareil. On vous préviendra au bon moment.", url: "/espace", tag: "test" });
  return sent > 0 ? { ok: true } : { ok: false, error: "Aucun appareil abonné ou notifications non configurées." };
}

type SubmissionResult = { ok: true; message: string } | { ok: false; error: string };

/** Enregistre le brouillon ou la livraison finale. Les pièces jointes restent privées dans Cloudinary. */
export async function saveSubmissionAction(formData: FormData): Promise<SubmissionResult> {
  const { session, participant } = await requireParticipant();
  if (participant.status !== "registered" && participant.status !== "delivered") return { ok: false, error: "La livraison est réservée aux participants inscrits." };
  const formId = z.string().min(1).max(64).safeParse(formData.get("formId"));
  const intent = formData.get("intent") === "submit" ? "submit" : "draft";
  if (!formId.success) return { ok: false, error: "Formulaire introuvable." };
  const form = await db.submissionForm.findUnique({ where: { id: formId.data }, include: { fields: { orderBy: { position: "asc" } } } });
  if (!form) return { ok: false, error: "Formulaire introuvable." };
  const now = new Date();
  const isOpen = form.status === "published" && (!form.opensAt || form.opensAt <= now) && (!form.closesAt || form.closesAt >= now);
  if (!isOpen) return { ok: false, error: "Ce formulaire n'est pas ouvert actuellement." };
  const answers: Record<string, string | boolean> = {};
  for (const field of form.fields) {
    if (field.type === "file") continue;
    const raw = formData.get(`answer_${field.id}`);
    const value = field.type === "checkbox" ? raw === "on" : typeof raw === "string" ? raw.trim() : "";
    if (intent === "submit" && field.required && (value === "" || value === false)) return { ok: false, error: `Le champ « ${field.label} » est obligatoire.` };
    if (field.type === "url" && value && !z.url().safeParse(value).success) return { ok: false, error: `Le lien « ${field.label} » est invalide.` };
    if (field.type === "select" && value && !((field.options as string[] | null) ?? []).includes(String(value))) return { ok: false, error: `Le choix « ${field.label} » est invalide.` };
    answers[field.id] = value;
  }
  const existing = await db.submission.findUnique({ where: { formId_participantId: { formId: form.id, participantId: participant.id } }, include: { attachments: true } });
  if (existing?.status !== "draft") return { ok: false, error: "Cette livraison est déjà envoyée et ne peut plus être modifiée." };
  const fileEntries = form.fields.flatMap((field) => {
    if (field.type !== "file") return [];
    const files = formData.getAll(`file_${field.id}`).filter((item): item is File => item instanceof File && item.size > 0);
    return files.map((file) => ({ field, file }));
  });
  for (const field of form.fields.filter((item) => item.type === "file")) {
    const files = fileEntries.filter((entry) => entry.field.id === field.id);
    if (intent === "submit" && field.required && !files.length && !existing?.attachments.some((a) => a.fieldId === field.id)) return { ok: false, error: `Le fichier « ${field.label} » est obligatoire.` };
    if (files.length > field.maxFiles) return { ok: false, error: `Trop de fichiers pour « ${field.label} ».` };
  }
  if (fileEntries.some(({ file }) => file.size > 4_000_000)) return { ok: false, error: "Chaque fichier doit faire au maximum 4 Mo." };
  if (fileEntries.length && !isCloudinaryConfigured()) return { ok: false, error: "Cloudinary n'est pas encore configuré." };
  const submission = existing ?? await db.submission.create({ data: { formId: form.id, participantId: participant.id, answers } });
  if (existing) await db.submission.update({ where: { id: submission.id }, data: { answers } });
  if (fileEntries.length) {
    const attachments = await Promise.all(fileEntries.map(async ({ field, file }) => {
      const storageKey = await uploadPrivateFile(file, `kraken/submissions/${submission.id}`);
      return { submissionId: submission.id, fieldId: field.id, storageKey, fileName: file.name.slice(0, 255), contentType: file.type || "application/octet-stream", size: file.size };
    }));
    await db.submissionAttachment.createMany({ data: attachments });
  }
  if (intent === "submit") {
    await db.$transaction([
      db.submission.update({ where: { id: submission.id }, data: { status: "submitted", submittedAt: now } }),
      db.participant.update({ where: { id: participant.id }, data: { status: "delivered" } }),
    ]);
    await audit({ actorId: session.user.id, action: "submission.submit", targetType: "submission", targetId: submission.id });
  } else {
    await audit({ actorId: session.user.id, action: "submission.draft", targetType: "submission", targetId: submission.id });
  }
  revalidatePath("/espace/livraison");
  revalidatePath("/espace");
  return { ok: true, message: intent === "submit" ? "Livraison envoyée au jury." : "Brouillon enregistré." };
}
