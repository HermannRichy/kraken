/**
 * Crée (ou met à jour) le premier administrateur.
 *   FIRST_ADMIN_EMAIL=kraken@hustlerlabs.tech FIRST_ADMIN_PASSWORD=... npm run db:seed
 * Sans FIRST_ADMIN_PASSWORD, le compte est créé sans mot de passe : utiliser
 * « Mot de passe oublié » sur /admin/connexion pour le définir.
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
  console.log(`Admin prêt : ${email}${password ? " (mot de passe défini)" : " (définir le mot de passe via « Mot de passe oublié »)"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
