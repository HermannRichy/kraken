import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader, Panel } from "@/components/dashboard/ui";
import { PaymentPanel } from "@/components/espace/payment-panel";
import { canPay, fmtDateTime, PAYMENT_STATUS } from "@/components/espace/status";
import { NETWORKS, REGISTRATION_FEE } from "@/config/payment";
import { db } from "@/lib/server/db";
import { isMockMode } from "@/lib/server/feexpay";
import { requireParticipant } from "@/lib/server/session";
import { cn, formatAmount } from "@/lib/utils";

export const metadata: Metadata = { title: "Paiement" };

function Notice({ title, children, tone = "white" }: { title: string; children: React.ReactNode; tone?: "white" | "blue" | "warn" }) {
  const tones = { white: "bg-white", blue: "bg-kraken text-white", warn: "bg-[#FFF4E5]" } as const;
  return (
    <section className={cn("flex flex-col gap-3 rounded-[24px] border-[3px] border-ink p-5 shadow-[5px_5px_0_#000] sm:p-6", tones[tone])}>
      <h2 className="text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">{title}</h2>
      <div className="text-[15px] font-semibold">{children}</div>
    </section>
  );
}

async function Payment() {
  const { participant } = await requireParticipant();
  const payments = await db.payment.findMany({ where: { participantId: participant.id }, orderBy: { createdAt: "desc" }, take: 20 });
  const pending = payments.find((p) => p.status === "pending");
  const paid = payments.find((p) => p.status === "succeeded");
  const nationalPhone = parsePhoneNumberFromString(participant.phone)?.nationalNumber ?? "";
  const s = participant.status;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader title="Paiement" description={`Frais de participation : ${formatAmount(REGISTRATION_FEE)} FCFA, par Mobile Money.`} />

      <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          {s === "pre_registered" && (
            <Notice title="Confirmez d'abord votre adresse" tone="warn">
              Le paiement se débloque dès que vous avez cliqué sur le lien de confirmation reçu par e-mail.{" "}
              <Link href="/espace" className="font-extrabold underline underline-offset-4">
                Renvoyer le lien
              </Link>
            </Notice>
          )}
          {canPay(s) && (
            <section className="flex flex-col gap-5 rounded-[24px] border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_#0047FF] sm:p-7">
              <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Régler {formatAmount(REGISTRATION_FEE)} FCFA</h2>
              <PaymentPanel pendingPaymentId={pending?.id} defaultPhone={nationalPhone} defaultCountry={participant.country} mock={isMockMode()} />
            </section>
          )}
          {paid && !canPay(s) && (
            <Notice title="Frais réglés ✓" tone="blue">
              {formatAmount(paid.amount)} FCFA reçus le {fmtDateTime(paid.confirmedAt ?? paid.createdAt)}. Un reçu vous a été envoyé par e-mail.
            </Notice>
          )}
          {s === "waitlisted" && <Notice title="Liste d'attente">Aucun montant n&apos;a été débité. Si une place se libère, vous serez prévenu pour finaliser le paiement.</Notice>}
          {(s === "withdrawn" || s === "disqualified") && <Notice title="Paiement clôturé">Pour toute question sur un remboursement, contactez l&apos;organisation.</Notice>}
        </div>

        <Panel title="Bon à savoir" className="self-start">
          <ul className="flex flex-col gap-3 text-[15px] font-semibold">
            <li>Paiement sécurisé par FeexPay, aucune donnée de carte collectée.</li>
            <li>Un seul débit, même en cas de double clic.</li>
            <li>Les clés de test sont émises automatiquement dès la confirmation.</li>
          </ul>
        </Panel>
      </div>

      <Panel title="Historique">
        {payments.length === 0 ? (
          <p className="text-[15px] font-semibold text-steel">Aucun paiement pour l&apos;instant.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {payments.map((p) => {
              const st = PAYMENT_STATUS[p.status] ?? PAYMENT_STATUS.pending;
              return (
                <li key={p.id} className="flex flex-col gap-2 rounded-[16px] border-[3px] border-ink bg-paper p-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-extrabold">
                      {formatAmount(p.amount)} FCFA · {NETWORKS.find((n) => n.slug === p.network)?.label ?? p.network}
                    </div>
                    <div className="text-[13px] font-semibold break-all text-steel">
                      {fmtDateTime(p.createdAt)}
                      {p.providerRef ? ` · réf. ${p.providerRef}` : ""}
                      {p.failureReason ? ` · ${p.failureReason}` : ""}
                    </div>
                  </div>
                  <span className={cn("self-start rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-extrabold whitespace-nowrap sm:self-center", st.tone)}>{st.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}>
      <Payment />
    </Suspense>
  );
}
