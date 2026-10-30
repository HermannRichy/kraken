import "server-only";

import { db } from "../db";
import { env } from "../env";

type SendInput = {
  to: { email: string; name?: string };
  type: string;
  content: { subject: string; html: string; text: string };
  participantId?: string | null;
  replyTo?: string;
};

/**
 * Envoi transactionnel via l'API Brevo, journalisé en base (EmailLog).
 * Sans BREVO_API_KEY, l'e-mail est marqué « skipped » (et affiché dans la console en développement).
 * Ne lève jamais d'exception : un échec d'envoi ne doit pas casser le parcours.
 */
export async function sendEmail({ to, type, content, participantId = null, replyTo }: SendInput) {
  const { BREVO_API_KEY, EMAIL_FROM_NAME, EMAIL_FROM_ADDRESS, EMAIL_REPLY_TO } = env();
  const base = { participantId, to: to.email, type, subject: content.subject };

  if (!BREVO_API_KEY) {
    // Affichage console : en développement, ou explicitement via EMAIL_LOG_TO_CONSOLE=true (jamais en production réelle).
    if (process.env.NODE_ENV !== "production" || process.env.EMAIL_LOG_TO_CONSOLE === "true") {
      console.info(`\n✉️  [email:${type}] → ${to.email}\n${content.subject}\n${content.text}\n`);
    }
    await db.emailLog.create({ data: { ...base, status: "skipped", error: "BREVO_API_KEY absent" } });
    return { ok: false as const, skipped: true };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: EMAIL_FROM_NAME, email: EMAIL_FROM_ADDRESS },
        to: [{ email: to.email, ...(to.name ? { name: to.name } : {}) }],
        replyTo: { email: replyTo ?? EMAIL_REPLY_TO ?? EMAIL_FROM_ADDRESS },
        subject: content.subject,
        htmlContent: content.html,
        textContent: content.text,
        tags: [type],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const json = (await res.json().catch(() => ({}))) as { messageId?: string; message?: string };
    if (!res.ok) throw new Error(json.message || `Brevo ${res.status}`);
    await db.emailLog.create({ data: { ...base, status: "sent", providerId: json.messageId ?? null } });
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[email:${type}] échec`, message);
    await db.emailLog.create({ data: { ...base, status: "failed", error: message.slice(0, 500) } });
    return { ok: false as const, skipped: false };
  }
}
