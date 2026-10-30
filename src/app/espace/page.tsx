import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Countdown } from "@/components/features/countdown";
import { KeysPanel } from "@/components/espace/keys-panel";
import { PaymentPanel } from "@/components/espace/payment-panel";
import { PushPrompt } from "@/components/espace/push-prompt";
import { ResendVerification, SignOutButton, WelcomeToast } from "@/components/espace/small";
import { Burst, Star } from "@/components/ui/doodles";
import { Container, Sticker } from "@/components/ui/primitives";
import { countryName } from "@/config/countries";
import { LEVELS } from "@/lib/validation";
import { db } from "@/lib/server/db";
import { isMockMode } from "@/lib/server/feexpay";
import { readKeys } from "@/lib/server/participants";
import { requireParticipant } from "@/lib/server/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false, follow: false } };

const STATUS: Record<string, { label: string; tone: string }> = {
  pre_registered: { label: "E-mail à confirmer", tone: "bg-white text-ink" },
  email_confirmed: { label: "Paiement attendu", tone: "bg-[#FFF4E5] text-ink" },
  payment_pending: { label: "Paiement en cours", tone: "bg-[#FFF4E5] text-ink" },
  registered: { label: "Inscrit", tone: "bg-kraken text-white" },
  waitlisted: { label: "Liste d'attente", tone: "bg-ink text-white" },
  withdrawn: { label: "Désisté", tone: "bg-mist text-ink" },
  delivered: { label: "Livré", tone: "bg-kraken text-white" },
  evaluated: { label: "Évalué", tone: "bg-kraken text-white" },
  disqualified: { label: "Disqualifié", tone: "bg-[#C62828] text-white" },
};

const ORDER = ["pre_registered", "email_confirmed", "payment_pending", "registered", "delivered", "evaluated"];

function Timeline({ status }: { status: string }) {
  const idx = Math.max(0, ORDER.indexOf(status));
  const steps = [
    { label: "Inscription", done: true },
    { label: "E-mail confirmé", done: idx >= 1 },
    { label: "Frais réglés", done: idx >= 3 },
    { label: "Clés reçues", done: idx >= 3 },
    { label: "Livraison", done: idx >= 4 },
    { label: "Résultats", done: idx >= 5 },
  ];
  return (
    <ol className="grid grid-cols-3 gap-3 sm:grid-cols-6" aria-label="Avancement">
      {steps.map((s, i) => (
        <li key={s.label} className={cn("flex flex-col gap-2 rounded-2xl border-[3px] border-ink p-3", s.done ? "bg-kraken text-white" : "bg-white text-ink", i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]")}>
          <span className={cn("flex size-7 items-center justify-center rounded-full text-xs font-extrabold", s.done ? "bg-white text-kraken" : "bg-ink text-white")}>{s.done ? "✓" : i + 1}</span>
          <span className="text-[13px] leading-tight font-extrabold">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

function Card({ title, children, className, accent = "#000" }: { title: string; children: React.ReactNode; className?: string; accent?: string }) {
  return (
    <section className={cn("flex flex-col gap-5 rounded-[28px] border-[3px] border-ink bg-white p-6 sm:p-7", className)} style={{ boxShadow: `8px 8px 0 ${accent}` }}>
      <h2 className="text-2xl font-extrabold tracking-[-0.02em]">{title}</h2>
      {children}
    </section>
  );
}

async function Dashboard() {
  const { session, participant } = await requireParticipant();
  const pendingPayment =
    participant.status === "payment_pending"
      ? await db.payment.findFirst({ where: { participantId: participant.id, status: "pending" }, orderBy: { createdAt: "desc" }, select: { id: true } })
      : null;
  const keys = participant.status === "registered" ? readKeys(participant) : null;
  const status = STATUS[participant.status] ?? STATUS.pre_registered;
  const first = participant.fullName.split(/\s+/)[0];
  const nationalPhone = parsePhoneNumberFromString(participant.phone)?.nationalNumber ?? "";

  return (
    <>
      <WelcomeToast />
      <PushPrompt vapidKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY} />

      <section className="border-b-[3px] border-ink bg-paper">
        <Container className="flex flex-col gap-8 py-10 lg:py-14">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex flex-col gap-4">
              <span className={cn("inline-flex self-start rounded-full border-[3px] border-ink px-3.5 py-1.5 text-xs font-extrabold tracking-[0.08em] uppercase", status.tone)}>{status.label}</span>
              <h1 className="relative text-[2.4rem] leading-none font-extrabold tracking-[-0.045em] sm:text-6xl">
                Salut {first}.
                <Burst flip size={40} className="-top-8 -right-12" />
              </h1>
              <p className="max-w-[560px] text-[17px] font-semibold">Tout ce qu&apos;il vous faut pour construire, livrer et suivre votre résultat.</p>
            </div>
            <SignOutButton />
          </div>
          <Timeline status={participant.status} />
        </Container>
      </section>

      <section className="border-b-[3px] border-ink">
        <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-14">
          <div className="flex min-w-0 flex-col gap-10">
            {participant.status === "pre_registered" && (
              <Card title="Confirmez votre adresse">
                <p className="font-semibold">
                  Un lien a été envoyé à <strong className="break-all">{participant.email}</strong>. Cliquez dessus pour débloquer le paiement.
                </p>
                <ResendVerification email={participant.email} />
              </Card>
            )}

            {(participant.status === "email_confirmed" || participant.status === "payment_pending") && (
              <Card title="Réglez vos frais : 2 000 FCFA" accent="#0047FF">
                <p className="font-semibold text-steel">Dernière étape pour réserver votre place. Vos clés de test sont émises dès la confirmation.</p>
                <PaymentPanel pendingPaymentId={pendingPayment?.id} defaultPhone={nationalPhone} defaultCountry={participant.country} mock={isMockMode()} />
              </Card>
            )}

            {participant.status === "waitlisted" && (
              <Card title="Vous êtes en liste d'attente">
                <p className="font-semibold">Les places sont toutes prises pour l&apos;instant. Si une place se libère, vous serez prévenu par e-mail et notification, avec un lien valable 24 h.</p>
              </Card>
            )}

            {participant.status === "registered" && keys && participant.keysIssuedAt && (
              <div className="relative">
                <Card title="Vos clés de test KrakenPay" accent="#0047FF">
                  <KeysPanel masked={keys.masked} issuedLabel={participant.keysIssuedAt.toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo", dateStyle: "long", timeStyle: "short" })} />
                </Card>
                <Sticker tone="blue" className="-top-5 right-5 rotate-[7deg] text-sm">
                  Top
                  <br />
                  secret
                </Sticker>
              </div>
            )}

            {(participant.status === "withdrawn" || participant.status === "disqualified") && (
              <Card title={participant.status === "withdrawn" ? "Inscription annulée" : "Participation interrompue"}>
                <p className="font-semibold">
                  {participant.status === "disqualified" && participant.disqualifiedReason ? `Motif : ${participant.disqualifiedReason}. ` : ""}
                  Pour toute question, écrivez-nous depuis la page Organisateur.
                </p>
              </Card>
            )}

            <Card title="Documentation">
              <p className="font-semibold text-steel">Dossier du participant, contrats OpenAPI, cahier des charges et image Docker de KrakenPay.</p>
              <Link href="/documentation" className="inline-flex min-h-12 items-center self-start rounded-2xl border-[3px] border-ink bg-ink px-5 font-extrabold text-white shadow-[4px_4px_0_#0047FF]">
                Disponible le 10 novembre
              </Link>
            </Card>
          </div>

          <aside className="flex flex-col gap-8">
            <section className="relative rounded-[28px] border-4 border-ink bg-ink p-6 text-white shadow-[8px_8px_0_#0047FF]">
              <div className="mb-3 text-xs font-extrabold tracking-[0.1em] text-mist">PROCHAINE ÉTAPE</div>
              <Countdown showTitle />
              <Star size={28} color="#fff" className="-top-4 -right-3" />
            </section>
            <section className="flex flex-col gap-3 rounded-[28px] border-[3px] border-ink bg-white p-6 shadow-[6px_6px_0_#000]">
              <h2 className="text-lg font-extrabold">Mes informations</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {[
                  ["E-mail", participant.email],
                  ["GitHub", `@${participant.githubLogin}`],
                  ["Téléphone", participant.phone],
                  ["Lieu", `${participant.city}, ${countryName(participant.country)}`],
                  ["Niveau", LEVELS.find((l) => l.value === participant.level)?.label ?? participant.level],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-bold text-steel">{k}</dt>
                    <dd className="truncate font-extrabold" title={v}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-[13px] font-semibold text-steel">Une erreur ? Contactez l&apos;organisation depuis la page Organisateur.</p>
            </section>
            {session.user.role === "admin" || session.user.role === "moderator" ? (
              <Link href="/admin" className="text-sm font-extrabold underline">
                Aller à l&apos;administration
              </Link>
            ) : null}
          </aside>
        </Container>
      </section>
    </>
  );
}

function Loading() {
  return (
    <Container className="flex flex-col gap-6 py-14" aria-busy="true">
      <div className="h-10 w-64 animate-pulse rounded-2xl bg-paper" />
      <div className="h-24 animate-pulse rounded-[24px] bg-paper" />
      <div className="h-72 animate-pulse rounded-[28px] bg-paper" />
    </Container>
  );
}

export default function EspacePage() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}
