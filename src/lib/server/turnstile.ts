import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const turnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

/**
 * Vérifie un jeton Cloudflare Turnstile (usage unique, 5 min).
 * Désactivé tant que les clés ne sont pas configurées ; en cas d'indisponibilité, refus (fail closed).
 */
export async function verifyTurnstile(token: string | undefined, ip: string | null, action?: string): Promise<boolean> {
  if (!turnstileEnabled()) return true;
  if (!token || token.length > 2048) return false;
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, ...(ip ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    const data = (await res.json()) as { success: boolean; action?: string };
    if (!data.success) return false;
    return !action || !data.action || data.action === action;
  } catch {
    return false;
  }
}
