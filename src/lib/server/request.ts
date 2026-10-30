import "server-only";

import { headers } from "next/headers";

import { SITE_URL } from "@/config/site";

/** IP du client derrière le proxy de l'hébergeur (Vercel). */
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return h.get("x-real-ip");
}

/** Origines autorisées pour les requêtes qui modifient des données. */
export function allowedOrigins() {
  const list = new Set([SITE_URL]);
  if (process.env.BETTER_AUTH_URL) list.add(process.env.BETTER_AUTH_URL.replace(/\/$/, ""));
  if (process.env.VERCEL_URL) list.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.NODE_ENV !== "production") list.add("http://localhost:3000");
  return list;
}

/**
 * Vérifie que la requête vient bien du site (protection CSRF des route handlers).
 * Les server actions bénéficient déjà de la vérification d'origine intégrée à Next.js.
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") === "same-origin";
  return allowedOrigins().has(origin);
}
