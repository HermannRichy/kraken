/**
 * Crée (ou met à jour) le premier administrateur.
 *   FIRST_ADMIN_EMAIL=kraken@hustlerlabs.tech FIRST_ADMIN_PASSWORD=... npm run db:seed
 * Sans FIRST_ADMIN_PASSWORD (recommandé), le compte est créé sans mot de passe : l'admin
 * l'active lui-même depuis la page de connexion de l'équipe → « Première connexion : activer mon compte ».
 */
import "dotenv/config";

import { randomUUID } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! }) });

async function main() {
  const email = (process.env.FIRST_ADMIN_EMAIL ?? "kraken@hustlerlabs.tech").toLowerCase();
  const password = process.env.FIRST_ADMIN_PASSWORD;
  if (password && password.length < 12) throw new Error("FIRST_ADMIN_PASSWORD : 12 caractères minimum.");

  const user = await db.user.upsert({
    where: { email },
    create: { id: randomUUID(), email, name: "Équipe Kraken", emailVerified: true, role: "admin" },
    update: { role: "admin", emailVerified: true },
  });

  if (password) {
    const hash = await hashPassword(password);
    const existing = await db.account.findFirst({ where: { userId: user.id, providerId: "credential" } });
    if (existing) await db.account.update({ where: { id: existing.id }, data: { password: hash } });
    else await db.account.create({ data: { id: randomUUID(), accountId: user.id, providerId: "credential", userId: user.id, password: hash } });
  }

  await db.appSetting.upsert({ where: { key: "seatsCap" }, create: { key: "seatsCap", value: 100 }, update: {} });
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kraken.hustlerlabs.tech").replace(/\/$/, "");
  const gate = process.env.ADMIN_PATH?.trim().replace(/^\/+|\/+$/g, "");
  const loginUrl = `${site}/${gate || "admin/connexion"}`;
  console.log(`Admin prêt : ${email}`);
  console.log(password ? `Mot de passe défini. Connexion : ${loginUrl}` : `Activation par l'admin : ${loginUrl} → « Première connexion : activer mon compte » (le lien arrivera sur ${email}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
