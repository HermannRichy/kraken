import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({ title, children, className, action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("flex min-w-0 flex-col gap-4 rounded-[22px] border-[3px] border-ink bg-white p-4 shadow-[5px_5px_0_#000] sm:rounded-[24px] sm:p-6 sm:shadow-[6px_6px_0_#000]", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-xl font-extrabold tracking-[-0.02em]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Titre de page de l'administration, avec actions à droite (dessous sur mobile). */
export function PageHeader({ title, description, actions, back }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {back}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-[2rem] leading-[1.05] font-extrabold tracking-[-0.04em] break-words sm:text-4xl xl:text-5xl">{title}</h1>
          {description && <p className="text-[15px] font-semibold text-steel">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}

export function Stat({ label, value, tone = "white", hint, className }: { label: string; value: ReactNode; tone?: "white" | "blue" | "black"; hint?: string; className?: string }) {
  const tones = { white: "bg-white text-ink", blue: "bg-kraken text-white", black: "bg-ink text-white" } as const;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1 rounded-[20px] border-[3px] border-ink p-3.5 shadow-[4px_4px_0_#000] sm:p-4 sm:shadow-[5px_5px_0_#000]", tones[tone], className)}>
      <span className="text-[11px] leading-tight font-extrabold tracking-[0.08em] uppercase opacity-80 sm:text-xs">{label}</span>
      <span className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.03em] break-words sm:text-4xl">{value}</span>
      {hint && <span className="text-xs font-semibold opacity-80">{hint}</span>}
    </div>
  );
}

export const STATUS_LABELS: Record<string, string> = {
  pre_registered: "E-mail à confirmer",
  email_confirmed: "E-mail confirmé",
  payment_pending: "Paiement en cours",
  registered: "Inscrit",
  waitlisted: "Liste d'attente",
  withdrawn: "Désisté",
  delivered: "Livré",
  evaluated: "Évalué",
  disqualified: "Disqualifié",
};

const STATUS_TONES: Record<string, string> = {
  pre_registered: "bg-white",
  email_confirmed: "bg-[#FFF4E5]",
  payment_pending: "bg-[#FFF4E5]",
  registered: "bg-kraken text-white",
  waitlisted: "bg-ink text-white",
  withdrawn: "bg-mist",
  delivered: "bg-kraken text-white",
  evaluated: "bg-kraken text-white",
  disqualified: "bg-[#C62828] text-white",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-extrabold whitespace-nowrap", STATUS_TONES[status])}>{STATUS_LABELS[status] ?? status}</span>;
}

export const fmtDate = (d: Date) => d.toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo", dateStyle: "medium", timeStyle: "short" });
