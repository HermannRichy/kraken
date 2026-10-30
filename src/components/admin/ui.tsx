import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({ title, children, className, action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("flex min-w-0 flex-col gap-4 rounded-[24px] border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_#000] sm:p-6", className)}>
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

export function Stat({ label, value, tone = "white", hint }: { label: string; value: ReactNode; tone?: "white" | "blue" | "black"; hint?: string }) {
  const tones = { white: "bg-white text-ink", blue: "bg-kraken text-white", black: "bg-ink text-white" } as const;
  return (
    <div className={cn("flex flex-col gap-1 rounded-[20px] border-[3px] border-ink p-4 shadow-[5px_5px_0_#000]", tones[tone])}>
      <span className="text-xs font-extrabold tracking-[0.08em] uppercase opacity-80">{label}</span>
      <span className="text-4xl font-extrabold tracking-[-0.03em]">{value}</span>
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
