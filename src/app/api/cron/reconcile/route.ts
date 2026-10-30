import { NextResponse } from "next/server";

import { safeEqual } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { reconcilePayment } from "@/lib/server/payments";

/**
 * Réconciliation des paiements en attente (webhook perdu ou en retard).
 * Appelée par la tâche planifiée de l'hébergeur (vercel.json) avec Authorization: Bearer CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = env().CRON_SECRET;
  const provided = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || !provided || !safeEqual(provided, secret)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const pending = await db.payment.findMany({
    where: { status: "pending", createdAt: { lte: new Date(Date.now() - 60_000) } },
    select: { id: true },
    take: 50,
    orderBy: { createdAt: "asc" },
  });
  const results: Record<string, string | null> = {};
  for (const p of pending) results[p.id] = await reconcilePayment(p.id, { force: true });
  return NextResponse.json({ checked: pending.length, results });
}
