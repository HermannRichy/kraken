import "server-only";

import { env } from "./env";

/**
 * Client FeexPay (Mobile Money push).
 * Référence : intégration Maxi Views (requesttopay, statut, webhook).
 * - callback_info = notre identifiant de paiement (seul champ renvoyé tel quel dans le webhook)
 * - reference / order_id = identifiant FeexPay (à utiliser pour l'API de statut)
 * Mode « mock » : simulation locale (succès après ~8 s, échec si le numéro finit par 00).
 */

const BASE_URL = "https://api-v2.feexpay.me/api";

export type FeexStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

export class PaymentProviderError extends Error {
  constructor(
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
  }
}

function config() {
  const e = env();
  if (e.FEEXPAY_MODE === "mock") return { mode: "mock" as const };
  if (!e.FEEXPAY_API_KEY || !e.FEEXPAY_SHOP_ID) {
    throw new PaymentProviderError("Le paiement n'est pas encore configuré. Réessayez plus tard.");
  }
  return { mode: e.FEEXPAY_MODE, apiKey: e.FEEXPAY_API_KEY, shopId: e.FEEXPAY_SHOP_ID };
}

export function isMockMode() {
  return env().FEEXPAY_MODE === "mock";
}

async function call<T>(path: string, init: RequestInit & { apiKey: string }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { "content-type": "application/json", authorization: `Bearer ${init.apiKey}`, ...init.headers },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
  } catch {
    throw new PaymentProviderError("Le prestataire de paiement ne répond pas. Réessayez dans un instant.", true);
  }
  const json = (await res.json().catch(() => ({}))) as T & { message?: string };
  if (!res.ok) {
    throw new PaymentProviderError(json?.message || `Erreur du prestataire (${res.status}).`, res.status >= 500);
  }
  return json;
}

/** Déclenche la demande de paiement sur le téléphone du client. */
export async function requestToPay(input: { network: string; phone: string; amount: number; description: string; callbackInfo: string }) {
  const cfg = config();
  if (cfg.mode === "mock") {
    return { reference: `mock_${input.callbackInfo}_${Date.now()}`, status: "PENDING" as FeexStatus };
  }
  const data = await call<{ reference: string; status: FeexStatus; message?: string }>(`/transactions/public/requesttopay/${encodeURIComponent(input.network)}`, {
    method: "POST",
    apiKey: cfg.apiKey,
    body: JSON.stringify({
      shop: cfg.shopId,
      amount: input.amount,
      phoneNumber: input.phone,
      description: input.description,
      callback_info: input.callbackInfo,
    }),
  });
  if (!data.reference) throw new PaymentProviderError("Réponse inattendue du prestataire de paiement.");
  return { reference: data.reference, status: data.status };
}

/** Statut réel d'un paiement côté FeexPay (fait foi, jamais le payload du webhook). */
export async function getPaymentStatus(reference: string, phoneForMock?: string): Promise<{ status: FeexStatus; reason: string | null }> {
  const cfg = config();
  if (cfg.mode === "mock") {
    const created = Number(reference.split("_").pop());
    if (phoneForMock?.endsWith("00")) return { status: "FAILED", reason: "Paiement refusé (simulation)" };
    return { status: Date.now() - created > 8_000 ? "SUCCESSFUL" : "PENDING", reason: null };
  }
  const data = await call<{ status: FeexStatus; reason?: string | null }>(`/transactions/public/single/status/${encodeURIComponent(reference)}`, {
    method: "GET",
    apiKey: cfg.apiKey,
  });
  return { status: data.status, reason: data.reason ?? null };
}
