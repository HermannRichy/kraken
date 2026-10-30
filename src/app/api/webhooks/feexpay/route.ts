import { NextResponse } from "next/server";
import { z } from "zod";

import { safeEqual } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { getPaymentStatus } from "@/lib/server/feexpay";
import { applyPaymentResult } from "@/lib/server/payments";

/**
 * Webhook FeexPay.
 * 1. En-tête Authorization vérifié en temps constant (secret défini dans le dashboard FeexPay)
 * 2. Paiement retrouvé par callback_info (notre identifiant), jamais par reference
 * 3. Statut revérifié auprès de l'API FeexPay : le payload ne fait jamais foi
 * 4. Traitement idempotent : un webhook rejoué n'a aucun effet
 */
const payloadSchema = z.object({
  reference: z.string().min(1).max(200).optional(),
  order_id: z.string().min(1).max(200).optional(),
  callback_info: z.string().min(1).max(200),
  status: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  const secret = env().FEEXPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });

  const header = request.headers.get("authorization") ?? "";
  const provided = header.replace(/^(Bearer|Basic)\s+/i, "");
  if (!provided || !safeEqual(provided, secret)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const raw = await request.text();
  if (raw.length > 20_000) return NextResponse.json({ error: "Corps trop volumineux" }, { status: 413 });
  let body: z.infer<typeof payloadSchema>;
  try {
    body = payloadSchema.parse(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const payment = await db.payment.findUnique({ where: { id: body.callback_info } });
  if (!payment) return NextResponse.json({ error: "Transaction inconnue" }, { status: 404 });
  if (payment.status !== "pending") return NextResponse.json({ ok: true, ignored: "déjà traité" });

  const providerRef = body.reference ?? body.order_id ?? payment.providerRef;
  if (!providerRef) return NextResponse.json({ error: "Référence manquante" }, { status: 400 });
  if (payment.providerRef && payment.providerRef !== providerRef) {
    return NextResponse.json({ error: "Référence incohérente" }, { status: 409 });
  }

  const verified = await getPaymentStatus(providerRef, payment.phone).catch(() => null);
  if (!verified) return NextResponse.json({ error: "Vérification impossible, réessayez" }, { status: 503 });

  if (!payment.providerRef) await db.payment.update({ where: { id: payment.id }, data: { providerRef } });
  if (verified.status === "SUCCESSFUL" || verified.status === "FAILED") {
    await applyPaymentResult(payment.id, verified.status, verified.reason);
  }
  return NextResponse.json({ ok: true });
}
