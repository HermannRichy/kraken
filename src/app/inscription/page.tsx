import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { RegistrationForm } from "@/components/features/registration-form";
import { PageMotion } from "@/components/motion/page-motion";
import { Pop } from "@/components/motion/pop";
import { Burst, Star } from "@/components/ui/doodles";
import { Chip, Container, Highlight, Sticker } from "@/components/ui/primitives";
import { CHALLENGE } from "@/config/challenge";
import { pageMetadata } from "@/config/site";
import { seatsLeft } from "@/lib/server/participants";

export const metadata: Metadata = pageMetadata({
  title: "Inscription",
  description: "Inscrivez-vous à Kraken : Sold Out. 100 places, 2 000 FCFA par Mobile Money, solo, langage libre.",
  path: "/inscription",
});

const NEXT_STEPS = [
  ["01", "Vous confirmez votre adresse", "Lien valable 24 h, il vous connecte à votre espace."],
  ["02", "Vous réglez 2 000 FCFA", "Mobile Money, validation directement sur votre téléphone."],
  ["03", "Vous recevez vos clés", "Clés de test KrakenPay dans votre espace, jamais par e-mail."],
];

async function Seats() {
  await connection();
  const left = await seatsLeft().catch(() => null);
  if (left === null) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-2xl border-[3px] border-ink bg-white px-4 py-3 text-ink">
      <span className="text-sm font-extrabold tracking-[0.06em]">PLACES RESTANTES</span>
      <span className="text-3xl font-extrabold tracking-[-0.03em]">
        {left}
        <span className="text-base">/{CHALLENGE.seats}</span>
      </span>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <PageMotion>
      <section className="border-b-[3px] border-ink bg-paper">
        <Container className="flex flex-col gap-6 pt-12 pb-12 lg:pt-16 lg:pb-14">
          <Chip doodle="burst">Inscription · {CHALLENGE.edition}</Chip>
          <h1 className="max-w-[900px] text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[72px] lg:leading-none">
            <span data-split>Prenez votre </span>
            <Highlight doodle={<Burst flip size={40} className="-top-8 -right-11" />}>place.</Highlight>
          </h1>
          <p data-reveal className="max-w-[640px] text-[17px] leading-normal font-semibold sm:text-xl">
            Deux minutes pour vous inscrire. Une inscription = une personne = un dépôt GitHub.
          </p>
        </Container>
      </section>

      <section className="border-b-[3px] border-ink">
        <Container className="flex flex-col-reverse gap-12 py-12 lg:flex-row lg:items-start lg:py-16">
          <div className="relative min-w-0 flex-1">
            <RegistrationForm />
          </div>

          <aside className="w-full flex-none lg:sticky lg:top-6 lg:w-[360px]">
            <Pop pop={false} lift={-6} scale={1.01}>
              <div className="flex flex-col gap-5 rounded-[28px] border-4 border-ink bg-kraken p-6 text-white shadow-[10px_10px_0_#000] lg:distort-e">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[13px] font-extrabold tracking-[0.08em]">FRAIS DE PARTICIPATION</div>
                    <div className="text-5xl font-extrabold tracking-[-0.04em]">2 000 F</div>
                  </div>
                  <span className="rounded-full border-2 border-white px-3 py-1 text-xs font-extrabold">CFA</span>
                </div>
                <Suspense fallback={<div className="h-[62px] rounded-2xl border-[3px] border-ink bg-white/60" />}>
                  <Seats />
                </Suspense>
                <ol className="flex flex-col gap-4">
                  {NEXT_STEPS.map(([n, t, d]) => (
                    <li key={n} className="flex gap-3">
                      <span className="flex size-9 flex-none items-center justify-center rounded-full bg-ink text-sm font-extrabold">{n}</span>
                      <div>
                        <div className="font-extrabold">{t}</div>
                        <div className="text-sm font-semibold text-white/85">{d}</div>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="border-t-2 border-white/30 pt-4 text-[13px] font-semibold text-white/85">Remboursable jusqu&apos;à 7 jours après l&apos;inscription. Au-delà de 100 inscrits : liste d&apos;attente.</p>
              </div>
              <Sticker variant="torn" tone="black" className="-top-5 -right-3 rotate-[8deg] text-sm">
                Solo
                <br />
                only
              </Sticker>
              <Star size={30} className="-bottom-5 -left-4" />
            </Pop>
          </aside>
        </Container>
      </section>
    </PageMotion>
  );
}
