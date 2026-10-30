import type { ReactNode } from "react";

import { Container } from "@/components/ui/primitives";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="border-b-[3px] border-ink bg-ink py-14 text-white lg:py-20">
      <Container className="flex flex-wrap items-start gap-12">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-5">
          <span className="self-start rounded-full border-[3px] border-white px-3.5 py-1.5 text-xs font-extrabold tracking-[0.08em]">ESPACE ÉQUIPE</span>
          <h1 className="text-[2.4rem] leading-none font-extrabold tracking-[-0.045em] sm:text-6xl">Administration</h1>
          <p className="max-w-[460px] text-[17px] font-semibold text-mist">Accès réservé à l&apos;équipe HustlerLabs. Double authentification obligatoire.</p>
        </div>
        <div className="w-full max-w-[480px] flex-[1_1_360px] rounded-[30px] border-4 border-white bg-white p-6 text-ink shadow-[10px_10px_0_#0047FF] sm:p-8">{children}</div>
      </Container>
    </section>
  );
}
