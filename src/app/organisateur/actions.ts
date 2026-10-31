"use server";

import { hashIp } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { sendEmail } from "@/lib/server/email/send";
import { templates } from "@/lib/server/email/templates";
import { env } from "@/lib/server/env";
import { rateLimitAll, retryMessage } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import { verifyTurnstile } from "@/lib/server/turnstile";
import { contactSchema, fieldErrors, type ContactInput } from "@/lib/validation";

export type ContactResult = { ok: true } | { ok: false; message: string; errors?: Record<string, string> };

/** Formulaire de contact : enregistrement en base, e-mail à l'équipe et accusé de réception. */
export async function contactAction(input: ContactInput): Promise<ContactResult> {
  const ip = await getClientIp();
  const ipHash = hashIp(ip) ?? "unknown";
  const limit = await rateLimitAll([
    [`contact:ip:${ipHash}`, 5, 60 * 60],
    [`contact:burst:${ipHash}`, 1, 30],
  ]);
  if (!limit.ok) return { ok: false, message: retryMessage(limit.retryAfter) };

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Certains champs sont à corriger.", errors: fieldErrors(parsed.error) };
  const { name, email, message, website, startedAt, captcha } = parsed.data;
  if (website || Date.now() - startedAt < 3000) return { ok: false, message: "Envoi refusé. Réessayez." };
  if (!(await verifyTurnstile(captcha, ip, "contact"))) return { ok: false, message: "Vérification anti-robot échouée. Réessayez.", errors: { captcha: "Vérification anti-robot échouée." } };

  await db.contactMessage.create({ data: { name, email, message, ipHash } });
  await Promise.all([
    sendEmail({ to: { email: env().EMAIL_FROM_ADDRESS, name: "Équipe Kraken" }, type: "contact_notify", replyTo: email, content: templates.contactNotify({ name, email, message }) }),
    sendEmail({ to: { email, name }, type: "contact_ack", content: templates.contactAck({ name }) }),
  ]);
  return { ok: true };
}
