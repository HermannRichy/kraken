/**
 * Lien d'activation (ou de réinitialisation) d'un compte d'équipe, sans passer par l'e-mail.
 *   pnpm admin:link                      → compte FIRST_ADMIN_EMAIL
 *   pnpm admin:link autre@domaine.com    → autre membre de l'équipe
 *   pnpm admin:reset [email]             → remise à zéro complète avant le lien : mot de passe,
 *                                          double authentification et sessions supprimés
 *                                          (pour qu'une autre personne active le compte depuis le début)
 * Affiche aussi un diagnostic (mot de passe, 2FA, derniers e-mails envoyés).
 * Le lien est valable 1 heure et utilisable une seule fois. Ne le partagez qu'avec la personne concernée.
 */
import "dotenv/config";

import { randomBytes, randomUUID } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! }) });

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const token = () => Array.from(randomBytes(32), (b) => ALPHABET[b % ALPHABET.length]).join("").slice(0, 32);

async function main() {
  const args = process.argv.slice(2);
  const reset = args.includes("--reset");
  const email = (args.find((a) => !a.startsWith("--")) ?? process.env.FIRST_ADMIN_EMAIL ?? "kraken@hustlerlabs.tech").trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error(`Aucun compte pour ${email}. Lancez d'abord : pnpm db:seed`);
  if (user.role !== "admin" && user.role !== "moderator") throw new Error(`${email} n'est pas un compte d'équipe (rôle : ${user.role}).`);

  if (reset) {
    await db.$transaction([
      db.twoFactor.deleteMany({ where: { userId: user.id } }),
      db.session.deleteMany({ where: { userId: user.id } }),
      db.account.deleteMany({ where: { userId: user.id, providerId: "credential" } }),
      db.verification.deleteMany({ where: { value: user.id, identifier: { startsWith: "reset-password:" } } }),
      db.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false } }),
    ]);
    console.log("\nRemise à zéro effectuée : mot de passe, double authentification, sessions et anciens liens supprimés.");
  }

  const [credential, emails] = await Promise.all([
    db.account.findFirst({ where: { userId: user.id, providerId: "credential" }, select: { id: true } }),
    db.emailLog.findMany({ where: { to: email }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  console.log(`\nCompte       : ${email} (${user.role})`);
  console.log(`Mot de passe : ${credential ? "défini" : "non défini (compte à activer)"}`);
  console.log(`2FA          : ${user.twoFactorEnabled && !reset ? "active (le code sera demandé à la connexion)" : "à activer après la connexion (QR code)"}`);
  console.log(`Brevo        : ${process.env.BREVO_API_KEY ? "clé présente" : "BREVO_API_KEY absente : aucun e-mail ne part"}`);
  console.log("Derniers e-mails :");
  if (!emails.length) console.log("  aucun envoi enregistré pour cette adresse");
  for (const e of emails) console.log(`  ${e.createdAt.toISOString()}  ${e.type.padEnd(14)} ${e.status}${e.error ? `  → ${e.error.slice(0, 160)}` : ""}`);

  // Même format que better-auth (requestPasswordReset) : identifiant « reset-password:<jeton> », valeur = id utilisateur.
  const t = token();
  await db.verification.create({
    data: { id: randomUUID(), identifier: `reset-password:${t}`, value: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kraken.hustlerlabs.tech").replace(/\/$/, "");
  const gate = process.env.ADMIN_PATH?.trim().replace(/^\/+|\/+$/g, "");
  console.log(`\nLien ${credential ? "de réinitialisation" : "d'activation"} (1 h, usage unique) :`);
  console.log(`${site}/${gate || "admin"}/mot-de-passe?token=${t}\n`);
  console.log("Ensuite : se connecter, puis activer la double authentification (demandée automatiquement).\n");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
