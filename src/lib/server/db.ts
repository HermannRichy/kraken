import "server-only";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Client Prisma unique.
 * - Neon (URL *.neon.tech) : pilote serverless Neon (WebSocket), adapté à Vercel.
 * - Ailleurs (PostgreSQL local, recette) : pilote node-postgres.
 */
function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");
  const adapter = /neon\.tech/.test(url) ? new PrismaNeon({ connectionString: url }) : new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter, log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
