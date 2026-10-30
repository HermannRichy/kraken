"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { payAction } from "@/app/espace/actions";
import { SelectField, Spinner, SubmitButton, TextField } from "@/components/form/fields";
import { countryName } from "@/config/countries";
import { NETWORKS, REGISTRATION_FEE } from "@/config/payment";
import { formatAmount } from "@/lib/utils";
import { paymentSchema, fieldErrors } from "@/lib/validation";

type Props = {
  pendingPaymentId?: string | null;
  defaultPhone?: string;
  defaultCountry?: string;
  mock?: boolean;
};

type Phase = "form" | "waiting" | "success";

const POLL_MS = 3000;
const MAX_WAIT_MS = 6 * 60_000;

/** Paiement Mobile Money : choix du réseau, demande poussée sur le téléphone, suivi en direct. */
export function PaymentPanel({ pendingPaymentId, defaultPhone = "", defaultCountry = "BJ", mock }: Props) {
  const router = useRouter();
  const firstNetwork = NETWORKS.find((n) => n.country === defaultCountry)?.slug ?? "mtn";
  const [network, setNetwork] = useState<string>(firstNetwork);
  const [phone, setPhone] = useState(defaultPhone);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>(pendingPaymentId ? "waiting" : "form");
  const [paymentId, setPaymentId] = useState<string | null>(pendingPaymentId ?? null);
  const [pending, startTransition] = useTransition();
  const idempotencyKey = useRef<string>("");
  const startedAt = useRef<number>(0);

  useEffect(() => {
    idempotencyKey.current = crypto.randomUUID();
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, (typeof NETWORKS)[number][]>();
    for (const n of NETWORKS) map.set(n.country, [...(map.get(n.country) ?? []), n]);
    return [...map.entries()];
  }, []);
  const current = NETWORKS.find((n) => n.slug === network);

  // Suivi du paiement
  useEffect(() => {
    if (phase !== "waiting" || !paymentId) return;
    startedAt.current = Date.now();
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      try {
        const res = await fetch(`/api/paiements/${paymentId}`, { cache: "no-store" });
        if (res.ok) {
          const json = (await res.json()) as { status: string; failureReason: string | null };
          if (json.status === "succeeded") {
            setPhase("success");
            toast.success("Paiement confirmé", { description: "Votre place est réservée. Bienvenue dans le défi !" });
            window.setTimeout(() => router.refresh(), 1200);
            return;
          }
          if (json.status === "failed") {
            toast.error("Paiement non abouti", { description: json.failureReason ?? "Aucun montant n'a été débité." });
            idempotencyKey.current = crypto.randomUUID();
            setPaymentId(null);
            setPhase("form");
            router.refresh();
            return;
          }
        }
      } catch {
        /* réseau instable : on réessaie */
      }
      if (Date.now() - startedAt.current > MAX_WAIT_MS) {
        toast.message("Toujours en attente", { description: "Nous vérifions le paiement en arrière-plan. Vous serez prévenu par e-mail." });
        return;
      }
      window.setTimeout(tick, POLL_MS);
    };
    const t = window.setTimeout(tick, POLL_MS);
    return () => {
      stopped = true;
      window.clearTimeout(t);
    };
  }, [phase, paymentId, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = { network, phone, idempotencyKey: idempotencyKey.current };
    const parsed = paymentSchema.safeParse(input);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    startTransition(async () => {
      const res = await payAction(input);
      if (res.ok) {
        setPaymentId(res.paymentId);
        setPhase("waiting");
        toast.message("Demande envoyée", { description: "Validez le paiement sur votre téléphone." });
      } else {
        if (res.errors) setErrors(res.errors);
        toast.error(res.error);
        if (res.waitlisted) router.refresh();
      }
    });
  };

  if (phase === "success") {
    return (
      <div role="status" className="flex items-center gap-4 rounded-[24px] border-[3px] border-ink bg-kraken p-6 text-white shadow-[8px_8px_0_#000]">
        <span className="text-4xl" aria-hidden="true">
          ✓
        </span>
        <div>
          <div className="text-2xl font-extrabold">Paiement confirmé.</div>
          <div className="font-semibold text-white/85">Chargement de vos clés…</div>
        </div>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-5 rounded-[24px] border-[3px] border-ink bg-white p-6 shadow-[8px_8px_0_#0047FF]">
        <div className="flex items-center gap-4">
          <span className="relative flex size-16 flex-none items-center justify-center rounded-[18px] border-[3px] border-ink bg-paper" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="20" x="5" y="2" rx="2" />
              <path d="M12 18h.01" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 size-4 animate-ping rounded-full bg-kraken" />
          </span>
          <div>
            <div className="text-xl font-extrabold">Validez sur votre téléphone</div>
            <div className="text-[15px] font-semibold text-steel">Une demande de {formatAmount(REGISTRATION_FEE)} FCFA vient d&apos;arriver. Saisissez votre code Mobile Money pour confirmer.</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm font-bold text-steel">
          <Spinner className="size-4" /> En attente de confirmation… ne fermez pas cette page.
        </div>
        {mock && <p className="rounded-xl bg-paper p-3 text-[13px] font-semibold text-steel">Mode simulation : confirmation automatique en quelques secondes (un numéro finissant par 00 simule un refus).</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <SelectField label="Réseau Mobile Money" value={network} onChange={(e) => setNetwork(e.target.value)} error={errors.network}>
        {groups.map(([country, nets]) => (
          <optgroup key={country} label={countryName(country)}>
            {nets.map((n) => (
              <option key={n.slug} value={n.slug}>
                {n.label}
              </option>
            ))}
          </optgroup>
        ))}
      </SelectField>
      <TextField
        label="Numéro Mobile Money"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        hint="La demande de paiement arrivera sur ce numéro."
        addon={<span className="flex min-h-[52px] items-center rounded-[14px] border-[3px] border-ink bg-paper px-3.5 font-extrabold">+{current?.dial}</span>}
        required
      />
      <SubmitButton pending={pending} pendingLabel="Envoi de la demande…">
        Payer {formatAmount(REGISTRATION_FEE)} FCFA
      </SubmitButton>
      <p className="text-[13px] font-semibold text-steel">Paiement sécurisé par FeexPay. Aucune donnée de carte n&apos;est collectée. Un seul débit, même si vous cliquez deux fois.</p>
    </form>
  );
}
