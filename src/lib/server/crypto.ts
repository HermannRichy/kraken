import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

import { env } from "./env";

const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Chaîne aléatoire cryptographiquement sûre. */
export function randomString(length: number, alphabet = ALPHANUM) {
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[randomInt(alphabet.length)];
  return out;
}

function key() {
  const k = Buffer.from(env().KEYS_ENCRYPTION_KEY, "base64");
  if (k.length !== 32) throw new Error("KEYS_ENCRYPTION_KEY doit faire 32 octets (base64)");
  return k;
}

/** Chiffre une valeur sensible (AES-256-GCM). Format : iv.tag.data en base64url. */
export function encrypt(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, data].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(payload: string) {
  const [iv, tag, data] = payload.split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** Empreinte d'une IP (jamais stockée en clair). */
export function hashIp(ip: string | null) {
  if (!ip) return null;
  return createHash("sha256").update(`${env().IP_HASH_SALT}:${ip}`).digest("hex").slice(0, 32);
}

/** Comparaison en temps constant. */
export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Masque une clé pour l'affichage : sk_test_kraken_••••••••1a2b */
export function maskSecret(value: string, prefix: string) {
  return `${prefix}${"•".repeat(12)}${value.slice(-4)}`;
}
