import { KeyRound, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader, Panel } from "@/components/dashboard/ui";
import { KeysPanel } from "@/components/espace/keys-panel";
import { canPay, fmtDateTime, hasKeys } from "@/components/espace/status";
import { readKeys } from "@/lib/server/participants";
import { requireParticipant } from "@/lib/server/session";

export const metadata: Metadata = { title: "Mes clés" };

async function Keys() {
  const { participant } = await requireParticipant();
  const keys = hasKeys(participant.status) ? readKeys(participant) : null;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader title="Mes clés" description="Clés de test KrakenPay, personnelles et confidentielles." />

      {keys && participant.keysIssuedAt ? (
        <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="flex min-w-0 flex-col gap-5 rounded-[24px] border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_#0047FF] sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex size-11 flex-none items-center justify-center rounded-[12px] border-[3px] border-ink bg-kraken text-white">
                <KeyRound size={20} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Clés KrakenPay</h2>
            </div>
            <KeysPanel masked={keys.masked} issuedLabel={fmtDateTime(participant.keysIssuedAt)} />
          </section>
          <Panel title="Utilisation" className="self-start">
            <p className="text-[15px] font-semibold text-steel">Dans le fichier .env de votre projet (jamais commité) :</p>
            <pre className="overflow-x-auto rounded-[14px] border-[3px] border-ink bg-ink p-4 font-mono text-[13px] leading-relaxed text-white">
              {`KRAKENPAY_API_KEY=…\nKRAKENPAY_WEBHOOK_SECRET=…`}
            </pre>
            <p className="text-[13px] font-semibold text-steel">Une fuite ? Régénérez-les : les anciennes sont révoquées immédiatement.</p>
          </Panel>
        </div>
      ) : (
        <section className="flex flex-col items-start gap-4 rounded-[24px] border-[3px] border-dashed border-ink bg-white p-6 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-paper">
            <Lock size={22} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Pas encore disponibles</h2>
          <p className="max-w-[560px] text-[15px] font-semibold text-steel">Vos clés de test sont émises automatiquement dès que les frais de participation sont confirmés.</p>
          {(canPay(participant.status) || participant.status === "pre_registered") && (
            <Link href={participant.status === "pre_registered" ? "/espace" : "/espace/paiement"} className="inline-flex min-h-12 items-center rounded-[16px] border-[3px] border-ink bg-kraken px-5 font-extrabold text-white shadow-[4px_4px_0_#000]">
              {participant.status === "pre_registered" ? "Confirmer mon adresse" : "Aller au paiement"}
            </Link>
          )}
        </section>
      )}
    </div>
  );
}

export default function KeysPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}>
      <Keys />
    </Suspense>
  );
}
