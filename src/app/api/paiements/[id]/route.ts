import { NextResponse } from "next/server";

import { db } from "@/lib/server/db";
import { reconcilePayment } from "@/lib/server/payments";
import { rateLimit } from "@/lib/server/rate-limit";
import { getSession } from "@/lib/server/session";

/** Statut d'un paiement pour le suivi en direct dans l'espace participant (propriétaire uniquement). */
export async function GET(_request: Request, { params }: RouteContext<"/api/paiements/[id]">) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const limit = await rateLimit(`pay-status:${session.user.id}`, 60, 60);
  if (!limit.ok) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });

  const { id } = await params;
  const payment = await db.payment.findUnique({ where: { id }, include: { participant: { select: { userId: true } } } });
  // 404 aussi quand le paiement appartient à quelqu'un d'autre : on ne révèle pas son existence.
  if (!payment || payment.participant.userId !== session.user.id) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const status = payment.status === "pending" ? await reconcilePayment(id) : payment.status;
  const fresh = status === payment.status ? payment : await db.payment.findUnique({ where: { id } });
  return NextResponse.json(
    { status: fresh?.status ?? status, failureReason: fresh?.failureReason ?? null },
    { headers: { "cache-control": "no-store" } },
  );
}
