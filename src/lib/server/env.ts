import "server-only";

import { z } from "zod";

/**
 * Variables d'environnement serveur, validées au premier accès.
 * Aucune n'est exposée au navigateur (pas de préfixe NEXT_PUBLIC_ sauf mention).
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().optional(),
  KEYS_ENCRYPTION_KEY: z.string().min(40, "32 octets encodés en base64"),
  IP_HASH_SALT: z.string().min(16),
  FIRST_ADMIN_EMAIL: z.string().email().default("kraken@hustlerlabs.tech"),
  // E-mails (Brevo)
  BREVO_API_KEY: z.string().optional(),
  EMAIL_FROM_NAME: z.string().default("Kraken"),
  EMAIL_FROM_ADDRESS: z.string().email().default("kraken@hustlerlabs.tech"),
  EMAIL_REPLY_TO: z.string().email().optional(),
  // Paiement (FeexPay)
  FEEXPAY_MODE: z.enum(["live", "sandbox", "mock"]).default("live"),
  FEEXPAY_API_KEY: z.string().optional(),
  FEEXPAY_SHOP_ID: z.string().optional(),
  FEEXPAY_WEBHOOK_SECRET: z.string().optional(),
  // Notifications push
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default("mailto:kraken@hustlerlabs.tech"),
  // Documents privés (Cloudinary)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_URL: z.string().url().optional(),
  // Divers
  GITHUB_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | null = null;

export function env(): ServerEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Variables d'environnement invalides :\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
