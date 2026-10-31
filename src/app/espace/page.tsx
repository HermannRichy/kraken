import { ArrowRight, BookOpen, Bell, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { PageHeader, Panel } from "@/components/dashboard/ui";
import { ResendVerification } from "@/components/espace/small";
import { STATUS } from "@/components/espace/status";
import { Countdown } from "@/components/features/countdown";
import { Star } from "@/components/ui/doodles";
import { requireParticipant } from "@/lib/server/session";
import { cn } from "@/lib/utils";

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
  const current = steps.findIndex((s) => !s.done);
  return (
    <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-6" aria-label="Avancement">
      {steps.map((s, i) => (
        <li
          key={s.label}
          aria-current={i === current ? "step" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-2xl border-[3px] border-ink p-3 xl:flex-col xl:items-start",
            s.done ? "bg-kraken text-white" : i === current ? "bg-[#FFF4E5] text-ink shadow-[3px_3px_0_#000]" : "bg-white text-ink",
          )}
        >
          <span className={cn("flex size-7 flex-none items-center justify-center rounded-full text-xs font-extrabold", s.done ? "bg-white text-kraken" : "bg-ink text-white")}>{s.done ? "✓" : i + 1}</span>
          <span className="text-[13px] leading-tight font-extrabold">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

function ActionLink({ href, children, tone = "blue" }: { href: string; children: ReactNode; tone?: "blue" | "black" }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-13 items-center justify-center gap-2 self-stretch rounded-[16px] border-[3px] border-ink px-5 py-3 text-base font-extrabold transition-transform hover:-translate-y-0.5 sm:self-start",
        tone === "blue" ? "bg-kraken text-white shadow-[4px_4px_0_#000]" : "bg-ink text-white shadow-[4px_4px_0_#0047FF]",
      )}
    >
      {children}
      <ArrowRight size={18} strokeWidth={2.75} aria-hidden="true" />
    </Link>
  );
}

function NextStep({ status, email, reason }: { status: string; email: string; reason: string | null }) {
  const box = (title: string, body: ReactNode, action?: ReactNode) => (
    <section className="flex flex-col gap-4 rounded-[24px] border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_#0047FF] sm:p-6">
      <span className="text-[11px] font-extrabold tracking-[0.12em] text-kraken uppercase">Prochaine étape</span>
      <h2 className="text-2xl leading-tight font-extrabold tracking-[-0.02em] sm:text-[28px]">{title}</h2>
      <div className="text-[15px] font-semibold text-steel sm:text-base">{body}</div>
      {action}
    </section>
  );
  switch (status) {
    case "pre_registered":
      return box(
        "Confirmez votre adresse e-mail",
        <>
          Un lien a été envoyé à <strong className="break-all text-ink">{email}</strong>. Cliquez dessus pour débloquer le paiement.
        </>,
        <ResendVerification email={email} />,
      );
    case "email_confirmed":
      return box("Réglez vos frais : 2 000 FCFA", "Dernière étape pour réserver votre place. Vos clés de test sont émises dès la confirmation.", <ActionLink href="/espace/paiement">Payer par Mobile Money</ActionLink>);
    case "payment_pending":
      return box("Paiement en cours de confirmation", "Validez la demande sur votre téléphone. La page Paiement se met à jour toute seule.", <ActionLink href="/espace/paiement">Suivre le paiement</ActionLink>);
    case "registered":
      return box("Vos clés de test sont prêtes", "Récupérez-les, placez-les dans votre .env et préparez votre environnement avant l'ouverture du défi.", <ActionLink href="/espace/cles">Voir mes clés</ActionLink>);
    case "waitlisted":
      return box("Vous êtes en liste d'attente", "Les places sont toutes prises pour l'instant. Si une place se libère, vous serez prévenu par e-mail et notification, avec un lien valable 24 h.");
    case "delivered":
      return box("Livraison reçue", "Votre projet est entre les mains du jury. Les résultats seront publiés au classement.", <ActionLink href="/classement" tone="black">Voir le classement</ActionLink>);
    case "evaluated":
      return box("Résultats disponibles", "Votre évaluation est terminée.", <ActionLink href="/classement" tone="black">Voir le classement</ActionLink>);
    case "withdrawn":
      return box("Inscription annulée", "Pour toute question, écrivez-nous depuis la page Organisateur.", <ActionLink href="/organisateur" tone="black">Contacter l&apos;organisation</ActionLink>);
    default:
      return box("Participation interrompue", `${reason ? `Motif : ${reason}. ` : ""}Pour toute question, écrivez-nous depuis la page Organisateur.`, <ActionLink href="/organisateur" tone="black">Contacter l&apos;organisation</ActionLink>);
  }
}

const SHORTCUTS = [
  { href: "/espace/documentation", label: "Documentation", hint: "Dossier, contrats OpenAPI, image Docker", icon: BookOpen },
  { href: "/calendrier", label: "Calendrier", hint: "Toutes les dates clés du défi", icon: CalendarDays },
  { href: "/espace/notifications", label: "Notifications", hint: "Soyez prévenu en direct", icon: Bell },
];

async function Home() {
  const { participant } = await requireParticipant();
  const status = STATUS[participant.status] ?? STATUS.pre_registered;
  const first = participant.fullName.split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title={`Salut ${first}.`}
        description={
          <span className="flex flex-wrap items-center gap-2.5">
            <span className={cn("inline-flex rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-extrabold tracking-[0.04em] uppercase", status.tone)}>{status.label}</span>
            <span>Tout pour construire, livrer et suivre votre résultat.</span>
          </span>
        }
      />

      <Timeline status={participant.status} />

      <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <NextStep status={participant.status} email={participant.email} reason={participant.disqualifiedReason} />
        <section className="relative flex flex-col justify-center rounded-[24px] border-[3px] border-ink bg-ink p-5 text-white shadow-[6px_6px_0_#0047FF] sm:p-6">
          <div className="mb-3 text-[11px] font-extrabold tracking-[0.12em] text-mist">CALENDRIER</div>
          <Countdown showTitle />
          <Star size={26} color="#fff" className="-top-3.5 -right-2.5" />
        </section>
      </div>

      <Panel title="Raccourcis">
        <ul className="grid gap-3 md:grid-cols-3">
          {SHORTCUTS.map(({ href, label, hint, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="group flex h-full items-center gap-3.5 rounded-[18px] border-[3px] border-ink bg-paper p-4 transition-transform hover:-translate-y-0.5">
                <span className="flex size-11 flex-none items-center justify-center rounded-[12px] border-[3px] border-ink bg-white">
                  <Icon size={20} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold">{label}</span>
                  <span className="block text-[13px] font-semibold text-steel">{hint}</span>
                </span>
                <ArrowRight size={18} strokeWidth={2.75} aria-hidden="true" className="flex-none transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

export default function EspaceHome() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}>
      <Home />
    </Suspense>
  );
}
