import type { Metadata } from "next";

import { PageMotion } from "@/components/motion/page-motion";
import { FaqExplorer } from "@/components/features/faq-explorer";
import { AnimatedIcon } from "@/components/motion/animated-icon";
import { Pop } from "@/components/motion/pop";
import { Button } from "@/components/ui/button";
import { Burst } from "@/components/ui/doodles";
import { Chip, Container, Highlight, IconDot } from "@/components/ui/primitives";
import { CHALLENGE } from "@/config/challenge";
import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Frais, paiement, participation, langages, ressources, évaluation : toutes les réponses avant de vous inscrire.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <PageMotion>
      <section className="border-b-[3px] border-ink bg-paper">
        <Container className="flex flex-col gap-6 pt-14 pb-14 lg:pt-20 lg:pb-16">
          <Chip doodle="star-blue">05 · FAQ</Chip>
          <h1 className="max-w-[980px] text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[80px] lg:leading-[0.98]">
            <span data-split>Avant de payer quoi que ce </span>
            <Highlight doodle={<Burst flip size={40} className="-top-8 -right-11" />}>soit.</Highlight>
          </h1>
        </Container>
      </section>

      <section className="border-b-[3px] border-ink">
        <Container className="flex flex-wrap items-start gap-12 pt-14 pb-20 lg:pb-24">
          <div className="min-w-0 flex-[1_1_640px]">
            <FaqExplorer />
          </div>
          <aside className="relative min-w-0 flex-[1_1_320px] px-2 py-4 lg:sticky lg:top-8">
            <Pop>
              <div className="flex flex-col gap-4 rounded-[30px] border-4 border-ink bg-ink p-7 text-white shadow-[10px_10px_0_#0047FF] [transform:perspective(1000px)_rotateY(-10deg)_rotateX(4deg)_rotateZ(2deg)]">
                <IconDot tone="white">
                  <AnimatedIcon name="circle-help" size={26} />
                </IconDot>
                <h2 className="text-[28px] leading-[1.1] font-extrabold tracking-[-0.02em]">Pas trouvé votre réponse ?</h2>
                <p className="text-base leading-normal font-semibold text-mist">
                  Posez-la dans la communauté WhatsApp, le canal officiel. Chaque précision de règle est ajoutée au dossier, avec sa date.
                </p>
                <div className="self-start">
                  <Button href={CHALLENGE.whatsappUrl} variant="white-on-dark" icon="send">
                    Rejoindre la communauté
                  </Button>
                </div>
              </div>
              <Burst size={42} className="-top-2.5 -left-2.5" />
            </Pop>
          </aside>
        </Container>
      </section>
    </PageMotion>
  );
}
