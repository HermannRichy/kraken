import "server-only";

import { CHALLENGE } from "@/config/challenge";
import { SITE_URL } from "@/config/site";
import type { Prisma } from "@/generated/prisma/client";

import { decrypt, encrypt, maskSecret, randomString } from "./crypto";
import { db } from "./db";
import { env } from "./env";

/** Plafond de places (réglable par l'admin, 100 par défaut). */
export async function getSeatsCap() {
  const s = await db.appSetting.findUnique({ where: { key: "seatsCap" } });
  const n = typeof s?.value === "number" ? s.value : Number(s?.value);
  return Number.isFinite(n) && n > 0 ? n : CHALLENGE.seats;
}

/** Une place est « tenue » par un inscrit, ou par un paiement en cours de moins de 15 minutes. */
const HOLD_MINUTES = 15;

export async function countTakenSeats(tx: Prisma.TransactionClient | typeof db = db) {
  const since = new Date(Date.now() - HOLD_MINUTES * 60_000);
  const [registered, pending] = await Promise.all([
    tx.participant.count({ where: { status: { in: ["registered", "delivered", "evaluated"] } } }),
    tx.participant.count({ where: { status: "payment_pending", payments: { some: { status: "pending", createdAt: { gte: since } } } } }),
  ]);
  return registered + pending;
}

export async function seatsLeft() {
  const [cap, taken] = await Promise.all([getSeatsCap(), countTakenSeats()]);
  return Math.max(0, cap - taken);
}

/**
 * Clés de test KrakenPay.
 * En attendant POST /_admin/keys côté KrakenPay, elles sont générées localement au bon format.
 * Elles sont chiffrées en base et ne transitent jamais par e-mail.
 */
export function generateTestKeys() {
  return { testKey: `sk_test_kraken_${randomString(24)}`, webhookSecret: `whsec_${randomString(32)}` };
}

export function encryptedKeys() {
  const { testKey, webhookSecret } = generateTestKeys();
  return { testKeyEnc: encrypt(testKey), webhookSecretEnc: encrypt(webhookSecret), keysIssuedAt: new Date() };
}

export function readKeys(p: { testKeyEnc: string | null; webhookSecretEnc: string | null }) {
  if (!p.testKeyEnc || !p.webhookSecretEnc) return null;
  const testKey = decrypt(p.testKeyEnc);
  const webhookSecret = decrypt(p.webhookSecretEnc);
  return {
    testKey,
    webhookSecret,
    masked: { testKey: maskSecret(testKey, "sk_test_kraken_"), webhookSecret: maskSecret(webhookSecret, "whsec_") },
  };
}

/** Vérifie qu'un compte GitHub existe (et renvoie son identifiant numérique). */
export async function checkGithubUser(login: string): Promise<{ exists: boolean; id?: number; reachable: boolean }> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "kraken-sold-out",
        ...(env().GITHUB_TOKEN ? { authorization: `Bearer ${env().GITHUB_TOKEN}` } : {}),
      },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 3600 },
    });
    if (res.status === 404) return { exists: false, reachable: true };
    if (!res.ok) return { exists: true, reachable: false };
    const json = (await res.json()) as { id?: number; type?: string };
    return { exists: json.type === "User" || json.type === undefined, id: json.id, reachable: true };
  } catch {
    // GitHub injoignable : on n'empêche pas l'inscription, la vérification sera refaite à la livraison.
    return { exists: true, reachable: false };
  }
}

export const spaceUrl = (path = "") => `${SITE_URL}/espace${path}`;
