"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { regenerateKeysAction, revealKeysAction } from "@/app/espace/actions";
import { SubmitButton } from "@/components/form/fields";

type Props = { masked: { testKey: string; webhookSecret: string }; issuedLabel: string };

/** Clés de test KrakenPay : masquées par défaut, révélation et régénération consignées. */
export function KeysPanel({ masked, issuedLabel }: Props) {
  const [revealed, setRevealed] = useState<{ testKey: string; webhookSecret: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, startTransition] = useTransition();

  const reveal = () =>
    startTransition(async () => {
      if (revealed) return setRevealed(null);
      const res = await revealKeysAction();
      if (res.ok) setRevealed({ testKey: res.testKey, webhookSecret: res.webhookSecret });
      else toast.error(res.error);
    });

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiée`);
    } catch {
      toast.error("Copie impossible : sélectionnez le texte manuellement.");
    }
  };

  const regenerate = () =>
    startTransition(async () => {
      const res = await regenerateKeysAction(confirmText);
      if (res.ok) {
        toast.success("Nouvelles clés émises", { description: "Les anciennes sont révoquées." });
        setRevealed(null);
        setConfirming(false);
        setConfirmText("");
      } else toast.error(res.error ?? "Régénération impossible.");
    });

  const rows = [
    { label: "Clé d'API de test", env: "KRAKENPAY_API_KEY", value: revealed?.testKey ?? masked.testKey },
    { label: "Secret de webhook", env: "KRAKENPAY_WEBHOOK_SECRET", value: revealed?.webhookSecret ?? masked.webhookSecret },
  ];

  return (
    <div className="flex flex-col gap-5">
      {rows.map((r) => (
        <div key={r.env} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[15px] font-extrabold">{r.label}</span>
            <code className="text-xs font-bold text-steel">{r.env}</code>
          </div>
          <div className="flex gap-2">
            <code className="flex min-h-[52px] min-w-0 flex-1 items-center overflow-x-auto rounded-[14px] border-[3px] border-ink bg-ink px-4 font-mono text-sm whitespace-nowrap text-white" aria-label={revealed ? r.label : `${r.label} masquée`}>
              {r.value}
            </code>
            {revealed && (
              <button
                type="button"
                onClick={() => copy(r.value, r.label)}
                className="min-h-[52px] flex-none rounded-[14px] border-[3px] border-ink bg-white px-4 text-sm font-extrabold shadow-[3px_3px_0_#000]"
              >
                Copier
              </button>
            )}
          </div>
        </div>
      ))}
      <p className="text-[13px] font-semibold text-steel">
        Émises le {issuedLabel}. Chaque affichage est consigné. Ne les publiez jamais dans votre dépôt : utilisez <code>.env</code>.
      </p>
      <div className="flex flex-wrap gap-3">
        <SubmitButton type="button" tone="black" pending={pending && !confirming} pendingLabel="…" onClick={reveal}>
          {revealed ? "Masquer les clés" : "Afficher les clés"}
        </SubmitButton>
        {!confirming && (
          <button type="button" onClick={() => setConfirming(true)} className="min-h-14 px-3 text-[15px] font-extrabold underline decoration-[3px] underline-offset-4">
            Régénérer
          </button>
        )}
      </div>
      {confirming && (
        <div className="flex flex-col gap-3 rounded-[18px] border-[3px] border-ink bg-[#FFF4E5] p-4">
          <p className="text-sm font-bold">Les clés actuelles seront révoquées immédiatement. Tapez RÉGÉNÉRER pour confirmer.</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              aria-label="Confirmation"
              className="min-h-12 flex-1 rounded-[14px] border-[3px] border-ink px-4 font-extrabold uppercase outline-none focus:shadow-[3px_3px_0_#0047FF]"
              placeholder="RÉGÉNÉRER"
            />
            <SubmitButton type="button" tone="blue" pending={pending} pendingLabel="…" onClick={regenerate} className="min-h-12">
              Confirmer
            </SubmitButton>
            <button type="button" onClick={() => setConfirming(false)} className="min-h-12 px-3 font-extrabold">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
