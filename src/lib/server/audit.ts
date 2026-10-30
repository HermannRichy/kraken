import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import { hashIp } from "./crypto";
import { db } from "./db";
import { getClientIp } from "./request";

/** Journal d'audit des actions sensibles (auteur, cible, date, empreinte d'IP). */
export async function audit(entry: {
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  meta?: Prisma.InputJsonValue;
}) {
  const ip = await getClientIp().catch(() => null);
  await db.auditLog.create({ data: { ...entry, ipHash: hashIp(ip) } });
}
