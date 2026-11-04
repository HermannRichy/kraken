import type { Metadata } from "next";
import Image from "next/image";

import { PageMotion } from "@/components/motion/page-motion";
import { CtaBand } from "@/components/features/cta-band";
import { PageHero } from "@/components/features/page-hero";
import { AnimatedIcon } from "@/components/motion/animated-icon";
import { Pop } from "@/components/motion/pop";
import { Burst, Star } from "@/components/ui/doodles";
import { Chip, Container, H2, Highlight, IconDot, Sticker } from "@/components/ui/primitives";
import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Prix et certificats",
  description: "Des certificats vérifiables selon les conditions publiées et des prix pour les trois premiers.",
  path: "/prix",
});

export default function PrixPage() {
  return (
    <PageMotion>
      <PageHero
        chip={<Chip doodle="burst">04 · Prix et certificats</Chip>}
        title={
          <>
            <span data-split>Livrez. On vous le </span>
            <Highlight doodle={<Burst flip size={36} className="-top-7 -right-10" />}>certifie.</Highlight>
          </>
        }
        intro="Des certificats vérifiables selon les conditions publiées par l’organisation. Des prix sont prévus pour les trois premiers, selon le nombre de participants."
        aside={
          <div className="flex items-end justify-center gap-3 px-2.5 pt-10 sm:gap-[18px]">
            <Pop className="flex-1">
              <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-t-3xl rounded-b-xl border-[3px] border-ink bg-white shadow-[6px_6px_0_#000] [transform:perspective(800px)_rotateY(10deg)_rotateZ(-3deg)] sm:h-60">
                <div className="text-5xl leading-none font-extrabold sm:text-[56px]">2</div>
                <div className="px-2 text-center text-[11px] font-extrabold tracking-[0.08em] text-steel sm:text-[13px]">[LOT À ANNONCER]</div>
              </div>
            </Pop>
            <Pop className="flex-1">
              <div className="relative flex h-60 flex-col items-center justify-center gap-2 rounded-t-3xl rounded-b-xl border-[3px] border-ink bg-kraken text-white shadow-[8px_8px_0_#000] [transform:perspective(800px)_rotateY(-6deg)_rotateZ(2deg)] sm:h-[330px]">
                <AnimatedIcon name="party-popper" size={44} loop={3500} />
                <div className="text-6xl leading-none font-extrabold sm:text-[80px]">1</div>
                <div className="px-2 text-center text-[11px] font-extrabold tracking-[0.08em] sm:text-[13px]">[LOT À ANNONCER]</div>
                <Star size={40} className="-top-8 -left-6" />
                <Burst flip size={40} className="-top-12 right-2" />
              </div>
            </Pop>
            <Pop className="flex-1">
              <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-t-3xl rounded-b-xl border-[3px] border-ink bg-ink text-white shadow-[6px_6px_0_#0047FF] [transform:perspective(800px)_rotateY(-10deg)_rotateZ(-1.5deg)] sm:h-[190px]">
                <div className="text-4xl leading-none font-extrabold sm:text-5xl">3</div>
                <div className="px-2 text-center text-[11px] font-extrabold tracking-[0.08em] text-mist sm:text-[13px]">[LOT À ANNONCER]</div>
              </div>
            </Pop>
          </div>
        }
      >
        <Pop className="self-start" lift={-6}>
          <div className="rounded-[20px] border-[3px] border-ink bg-ink px-5 py-4 text-white shadow-[6px_6px_0_#0047FF] [transform:perspective(900px)_rotateY(8deg)_rotateZ(-1.5deg)]">
            <div className="text-xs font-extrabold tracking-[0.08em] text-mist sm:text-[13px]">LOTS DÉFINITIFS ANNONCÉS À LA CLÔTURE</div>
            <div className="text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">Date proposée : 9 novembre</div>
          </div>
        </Pop>
      </PageHero>

      {/* Certificats */}
      <section className="border-b-[3px] border-ink">
        <Container className="flex flex-wrap items-center gap-14 py-16 lg:py-24">
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-[26px]">
            <H2>Deux certificats. Vérifiables.</H2>
            {[
              { icon: "check", tone: "black", t: "Participation", d: "Prévu pour les participants ayant livré avant la date limite, selon les conditions définitives publiées par l’organisation : nom, titre du défi, date et signature HustlerLabs." },
              { icon: "sparkles", tone: "blue", t: "Mérite", d: "Pour les trois premiers, avec le rang obtenu." },
            ].map((c) => (
              <Pop key={c.t} pop={false} lift={-4} scale={1.01}>
                <div data-reveal className="flex items-start gap-4">
                  <IconDot tone={c.tone as "black" | "blue"} className="size-[52px] sm:size-[52px]">
                    <AnimatedIcon name={c.icon as "check" | "sparkles"} size={24} />
                  </IconDot>
                  <div>
                    <h3 className="mb-1.5 text-[22px] font-extrabold">{c.t}</h3>
                    <p className="text-base leading-normal font-semibold text-steel">{c.d}</p>
                  </div>
                </div>
              </Pop>
            ))}
            <p data-reveal className="text-base leading-normal font-bold">
              Chaque certificat porte un identifiant unique et un QR code vers une page publique de vérification.
            </p>
          </div>

          <div className="relative min-w-0 flex-[1_1_520px] px-2.5 py-8">
            <div className="distort-back absolute inset-x-5 top-12 bottom-5 rounded-[30px] border-4 border-ink bg-mist" aria-hidden="true" />
            <Pop lift={-10}>
              <div className="relative flex flex-col gap-[18px] rounded-[30px] border-4 border-ink bg-white p-6 shadow-[12px_12px_0_#000] [transform:perspective(1200px)_rotateY(-10deg)_rotateX(5deg)_rotateZ(2.5deg)] sm:p-[34px]">
                <div className="flex items-center justify-between gap-4">
                  <Image src="/brand/kraken-horizontal-noir.svg" alt="Kraken by HustlerLabs" width={130} height={40} className="h-8 w-[104px] sm:h-10 sm:w-[130px]" />
                  <span className="text-right text-[10px] font-extrabold tracking-[0.1em] text-steel sm:text-xs">CERTIFICAT DE PARTICIPATION</span>
                </div>
                <div className="text-sm font-bold text-steel">Décerné à</div>
                <div className="text-3xl leading-none font-extrabold tracking-[-0.03em] sm:text-[40px]">[Nom du participant]</div>
                <div className="text-base leading-normal font-semibold">
                  pour avoir livré une solution au défi <strong>Kraken</strong>, édition 01 — thème « Sold Out », le [date].
                </div>
                <div className="flex items-end justify-between gap-4 border-t-[3px] border-dashed border-ink pt-[18px]">
                  <div>
                    <div className="text-xs font-extrabold tracking-[0.08em] text-steel">IDENTIFIANT</div>
                    <div className="font-mono text-[15px] font-bold">KRK-01-[XXXX]</div>
                  </div>
                  <div className="qr-pattern size-[84px] rounded-xl border-[3px] border-ink" role="img" aria-label="QR code de vérification (illustration)" />
                </div>
              </div>
            </Pop>
            <Sticker tone="blue" className="top-1 left-0 -rotate-[11deg] text-[17px]">
              PDF
              <br />
              signé
            </Sticker>
          </div>
        </Container>
      </section>

      <CtaBand
        tone="black"
        title="Remise des prix"
        text="Les lauréats remplissent un formulaire de remise depuis leur espace participant, avant la date limite de réclamation : [DATE À FIXER]."
        href="/regles"
        label="Comment on note"
      />
    </PageMotion>
  );
}
