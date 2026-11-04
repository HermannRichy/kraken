import type { Metadata } from "next";

import { PageMotion } from "@/components/motion/page-motion";
import { CalendarTimeline } from "@/components/features/calendar";
import { Countdown } from "@/components/features/countdown";
import { PageHero } from "@/components/features/page-hero";
import { AnimatedIcon } from "@/components/motion/animated-icon";
import { Pop } from "@/components/motion/pop";
import { Burst, Star } from "@/components/ui/doodles";
import { Chip, Highlight } from "@/components/ui/primitives";
import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Calendrier",
  description: "Inscriptions, ouverture du défi, date limite de livraison, évaluation et résultats.",
  path: "/calendrier",
});

export default function CalendrierPage() {
  return (
    <PageMotion>
      <PageHero
        chip={<Chip doodle="squiggle">03 · Calendrier</Chip>}
        title={
          <>
            <span data-split>21 jours. Pas une </span>
            <Highlight doodle={<Star size={30} className="-bottom-6 -left-6" />}>seconde</Highlight>
            <span data-split> de plus.</span>
          </>
        }
        intro="Toutes les heures sont en heure du Bénin (UTC+1). Les dates affichées sont le calendrier proposé et restent à confirmer par l’organisation ; une fois la date limite validée, la livraison se verrouillera à la seconde près, sur l’horloge du serveur."
        aside={
          <div className="relative px-2.5 py-6">
            <Pop lift={-10}>
              <div className="flex flex-col gap-4 rounded-[30px] border-4 border-ink bg-ink p-6 text-white shadow-[12px_12px_0_#0047FF] [transform:perspective(1000px)_rotateY(8deg)_rotateX(-4deg)_rotateZ(-3deg)] sm:p-7">
                <div className="flex items-center gap-2.5 text-[13px] font-extrabold tracking-[0.1em] text-mist">
                  <AnimatedIcon name="timer" size={20} loop={4000} />
                  PROCHAINE ÉTAPE
                </div>
                <Countdown size="lg" showTitle />
              </div>
            </Pop>
            <Burst size={42} className="-top-1.5 -left-1.5" />
          </div>
        }
      />

      <section className="border-b-[3px] border-ink">
        <div className="mx-auto flex max-w-[960px] flex-col gap-7 px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <CalendarTimeline />
          <p data-reveal className="text-sm font-semibold text-steel sm:ml-20">Calendrier proposé : le jour d’ouverture des inscriptions et la validation des échéances restent à confirmer par l’organisation.</p>
        </div>
      </section>
    </PageMotion>
  );
}
