import "server-only";

import { db } from "./db";

export type RateLimitResult = { ok: true; remaining: number } | { ok: false; retryAfter: number };

/**
 * Limiteur de débit à fenêtre fixe, stocké en base (fonctionne en serverless, sans Redis).
 * Une seule requête SQL atomique par appel.
 *
 * @param key    identifiant de l'action + du demandeur (ex. "register:ip:<hash>")
 * @param limit  nombre de requêtes autorisées par fenêtre
 * @param windowSec durée de la fenêtre en secondes
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const rows = await db.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "Throttle" ("key", "count", "resetAt")
    VALUES (${key}, 1, NOW() + make_interval(secs => ${windowSec}))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "Throttle"."resetAt" < NOW() THEN 1 ELSE "Throttle"."count" + 1 END,
      "resetAt" = CASE WHEN "Throttle"."resetAt" < NOW() THEN NOW() + make_interval(secs => ${windowSec}) ELSE "Throttle"."resetAt" END
    RETURNING "count", "resetAt"
  `;
  const row = rows[0];
  if (row.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)) };
  }
  return { ok: true, remaining: limit - row.count };
}

/** Plusieurs limites à respecter toutes (ex. par IP et par e-mail). */
export async function rateLimitAll(rules: [key: string, limit: number, windowSec: number][]): Promise<RateLimitResult> {
  for (const [key, limit, windowSec] of rules) {
    const r = await rateLimit(key, limit, windowSec);
    if (!r.ok) return r;
  }
  return { ok: true, remaining: 0 };
}

export function retryMessage(retryAfter: number) {
  const min = Math.ceil(retryAfter / 60);
  return retryAfter < 90 ? `Trop de tentatives. Réessayez dans ${retryAfter} s.` : `Trop de tentatives. Réessayez dans ${min} min.`;
}
