import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

/** Page de connexion autonome (sans l'en-tête ni le pied de page du site). */
export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div data-admin-shell className="relative flex min-h-dvh flex-col bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,71,255,0.35),transparent_45%)]" aria-hidden="true" />
      <header className="relative flex items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <span className="text-xl font-extrabold tracking-[-0.04em]">KRAKEN</span>
        <span className="rounded-full border-[3px] border-white px-3 py-1 text-[11px] font-extrabold tracking-[0.08em]">ÉQUIPE</span>
      </header>
      <div className="relative flex flex-1 items-start justify-center px-4 pt-4 pb-12 sm:items-center sm:px-6 sm:pb-20">
        <div className="w-full max-w-[460px] rounded-[28px] border-4 border-white bg-white p-5 text-ink shadow-[8px_8px_0_#0047FF] sm:p-8 sm:shadow-[12px_12px_0_#0047FF]">{children}</div>
      </div>
      <p className="relative px-4 pb-6 text-center text-xs font-semibold text-mist">Accès réservé · Double authentification obligatoire · Connexions journalisées</p>
    </div>
  );
}
