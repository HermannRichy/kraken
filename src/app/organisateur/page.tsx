import type { Metadata } from "next";
import Image from "next/image";

import { ContactForm } from "@/components/features/contact-form";
import { AnimatedIcon } from "@/components/motion/animated-icon";
import { Pop } from "@/components/motion/pop";
import { Star } from "@/components/ui/doodles";
import { Chip, Container, H2, Highlight, IconDot, Sticker } from "@/components/ui/primitives";
import { CHALLENGE } from "@/config/challenge";

export const metadata: Metadata = {
  title: "Organisateur",
  description: "Kraken est une série de défis back-end portée par HustlerLabs.",
};

export default function OrganisateurPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b-[3px] border-ink bg-kraken text-white">
        <Image
          src="/brand/kraken-symbole-blanc.svg"
          alt=""
          aria-hidden="true"
          width={640}
          height={640}
          className="pointer-events-none absolute -top-16 -right-40 size-[360px] lg:-top-[120px] lg:-right-[200px] lg:size-[640px]"
        />
        <Container className="relative flex flex-col gap-6 pt-16 pb-20 lg:pt-[88px] lg:pb-24">
          <Chip dark doodle="burst">
            Organisateur
          </Chip>
          <h1 className="max-w-[820px] text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[80px] lg:leading-[0.98]">
            <span data-split>Des challenges de développement </span>
            <Highlight tone="white" doodle={<Star size={32} className="-bottom-6 -left-6" />}>
              exigeants.
            </Highlight>
          </h1>
          <p data-reveal className="max-w-[620px] text-[17px] leading-normal font-semibold sm:text-xl">
            Kraken est une série de défis back-end portée par HustlerLabs. « Sold Out » en est la première édition.
          </p>
        </Container>
      </section>

      <section id="contact" className="border-b-[3px] border-ink">
        <Container className="flex flex-wrap items-start gap-14 py-16 lg:py-24">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-7">
            <H2>HustlerLabs</H2>
            <p data-reveal className="text-base leading-relaxed font-semibold text-steel sm:text-lg">
              [Présentation de HustlerLabs : mission, équipe, éditions passées et à venir.]
            </p>
            <div className="flex flex-col gap-6 px-1 py-2">
              <Pop>
                <a
                  href={CHALLENGE.whatsappUrl}
                  className="distort-e flex items-center gap-[18px] rounded-[26px] border-[3px] border-ink bg-ink px-6 py-[22px] text-white no-underline shadow-[7px_7px_0_#0047FF]"
                >
                  <IconDot tone="white" className="size-[54px] sm:size-[54px]">
                    <AnimatedIcon name="users" size={24} />
                  </IconDot>
                  <span className="flex flex-col gap-1">
                    <span className="text-xl font-extrabold">Communauté WhatsApp</span>
                    <span className="text-sm font-semibold text-mist">Le canal officiel du défi</span>
                  </span>
                </a>
                <Sticker tone="blue" className="-top-[18px] right-3.5 rotate-[8deg] px-3 py-2 text-sm">
                  Officiel
                </Sticker>
              </Pop>
              <Pop>
                <a
                  href="#contact-form"
                  className="distort-b flex items-center gap-[18px] rounded-[26px] border-[3px] border-ink bg-white px-6 py-[22px] text-ink no-underline shadow-[7px_7px_0_#000]"
                >
                  <IconDot className="size-[54px] sm:size-[54px]">
                    <AnimatedIcon name="send" size={24} />
                  </IconDot>
                  <span className="flex flex-col gap-1">
                    <span className="text-xl font-extrabold">{CHALLENGE.contactEmail}</span>
                    <span className="text-sm font-semibold text-steel">Partenariats, presse, questions administratives</span>
                  </span>
                </a>
              </Pop>
            </div>
          </div>
          <div id="contact-form" className="min-w-0 flex-[1_1_480px]">
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
