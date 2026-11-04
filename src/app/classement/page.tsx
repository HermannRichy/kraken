import type { Metadata } from "next";

import { PageMotion } from "@/components/motion/page-motion";
import { AnimatedIcon } from "@/components/motion/animated-icon";
import { Pop } from "@/components/motion/pop";
import { Burst, Squiggle, Star } from "@/components/ui/doodles";
import { Chip, Container, H2, Highlight, IconDot, Sticker } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Classement",
  description: "Le classement public de Kraken, édition 01 — thème Sold Out, publié après l'évaluation.",
  path: "/classement",
});

const ROWS = [4, 5, 6, 7, 8, 9, 10];

export default function ClassementPage() {
  return (
    <PageMotion>
      <section className="border-b-[3px] border-ink bg-ink text-white">
        <Container className="flex flex-col gap-14 pt-14 pb-20 lg:pt-20 lg:pb-24">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="flex min-w-0 flex-[1_1_600px] flex-col gap-6">
              <Chip dark doodle="burst">
                Classement
              </Chip>
              <h1 className="text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[80px] lg:leading-[0.98]">
                <span data-split>Ils ont tenu sous la </span>
                <Highlight tone="blue-dark" doodle={<Star color="#fff" size={32} className="-bottom-6 -left-6" />}>
                  pression.
                </Highlight>
              </h1>
            </div>
            <Pop>
              <div className="rounded-[18px] border-[3px] border-white bg-white px-[18px] py-3.5 text-ink shadow-[6px_6px_0_#0047FF] [transform:perspective(900px)_rotateY(-10deg)_rotateZ(2deg)]">
                <div className="text-xs font-extrabold tracking-[0.08em] text-steel">RÉSULTATS PUBLIÉS LE</div>
                <div className="text-[26px] font-extrabold">8 décembre</div>
              </div>
            </Pop>
          </div>

          <div className="flex flex-wrap items-end justify-center gap-6 pt-8">
            <Pop className="order-2 w-full max-w-[320px] flex-[1_1_240px] sm:order-1">
              <div className="flex h-60 flex-col justify-between rounded-[28px] border-[3px] border-white bg-white p-[26px] text-ink shadow-[8px_8px_0_#626670] [transform:perspective(900px)_rotateY(10deg)_rotateZ(-2.5deg)]">
                <div className="text-[64px] leading-[0.9] font-extrabold">2</div>
                <div>
                  <div className="text-[22px] font-extrabold">[Participant]</div>
                  <div className="text-base font-bold text-steel">[XX,X] / 100</div>
                </div>
              </div>
            </Pop>
            <Pop className="order-1 w-full max-w-[340px] flex-[1_1_260px] sm:order-2">
              <div className="flex h-80 flex-col justify-between rounded-[28px] border-[3px] border-white bg-kraken p-7 text-white shadow-[10px_10px_0_#fff] [transform:perspective(900px)_rotateY(-6deg)_rotateZ(1.5deg)]">
                <div className="flex items-start justify-between">
                  <div className="text-[88px] leading-[0.9] font-extrabold">1</div>
                  <IconDot className="size-[60px] sm:size-[60px]">
                    <AnimatedIcon name="party-popper" size={28} loop={3500} />
                  </IconDot>
                </div>
                <div>
                  <div className="text-[26px] font-extrabold">[Participant]</div>
                  <div className="text-lg font-bold">[XX,X] / 100</div>
                </div>
              </div>
              <Burst flip color="#fff" size={40} className="-top-12 right-2.5" />
            </Pop>
            <Pop className="order-3 w-full max-w-[320px] flex-[1_1_240px]">
              <div className="flex h-[200px] flex-col justify-between rounded-[28px] border-[3px] border-white bg-ink p-[26px] text-white shadow-[8px_8px_0_#0047FF] [transform:perspective(900px)_rotateY(-10deg)_rotateZ(-1.5deg)]">
                <div className="text-[56px] leading-[0.9] font-extrabold">3</div>
                <div>
                  <div className="text-[22px] font-extrabold">[Participant]</div>
                  <div className="text-base font-bold text-mist">[XX,X] / 100</div>
                </div>
              </div>
            </Pop>
          </div>
        </Container>
      </section>

      <section className="border-b-[3px] border-ink">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <H2>
              Le classement complet.
              <Squiggle color="#0047FF" width={130} className="-bottom-6 left-0" />
            </H2>
            <p data-reveal className="max-w-[420px] text-[15px] leading-normal font-semibold text-steel">
              Le nom n&apos;apparaît qu&apos;avec le consentement du participant ; sinon, un pseudo. Le détail par critère reste privé, dans
              l&apos;espace participant.
            </p>
          </div>
          <div data-reveal className="overflow-x-auto pt-2 pr-3.5 pb-[18px] pl-1">
            <table className="w-full min-w-[520px] border-separate border-spacing-0 overflow-hidden rounded-[28px] border-4 border-ink bg-white shadow-[10px_10px_0_#000]">
              <thead>
                <tr className="bg-ink text-left text-[13px] font-extrabold tracking-[0.08em] text-white">
                  <th scope="col" className="w-[120px] px-6 py-4">RANG</th>
                  <th scope="col" className="px-6 py-4">NOM OU PSEUDO</th>
                  <th scope="col" className="w-[180px] px-6 py-4 text-right">SCORE</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((n, i) => (
                  <tr key={n} data-reveal className={cn("transition-colors hover:bg-kraken hover:text-white", i % 2 ? "bg-paper" : "bg-white")}>
                    <td className="border-t-[3px] border-ink px-6 py-[18px] text-2xl font-extrabold">{n}</td>
                    <td className="border-t-[3px] border-ink px-6 py-[18px] text-[17px] font-bold">[Participant]</td>
                    <td className="border-t-[3px] border-ink px-6 py-[18px] text-right text-[17px] font-extrabold">[XX,X] / 100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <Pop className="mx-auto max-w-[1200px]" lift={-6} scale={1.01}>
          <div className="distort-soft-a flex flex-wrap items-center justify-between gap-7 rounded-[30px] border-4 border-ink bg-paper p-7 shadow-[12px_12px_0_#000] sm:p-10 lg:rounded-[36px] lg:px-11">
            <div className="flex min-w-0 flex-[1_1_480px] items-start gap-[18px]">
              <IconDot>
                <AnimatedIcon name="file-text" size={26} />
              </IconDot>
              <div className="flex flex-col gap-2">
                <h2 className="text-[32px] font-extrabold tracking-[-0.02em]">Journal des tests</h2>
                <p className="text-base leading-relaxed font-semibold text-steel">
                  Publié et anonymisé après la fin des contestations, le 10 décembre. Un éventuel correctif est publié avec sa date.
                </p>
              </div>
            </div>
            <span className="inline-flex min-h-14 items-center gap-2.5 rounded-[18px] border-[3px] border-ink bg-white px-6 text-[17px] font-extrabold shadow-[5px_5px_0_#000]">
              <AnimatedIcon name="lock" size={18} />
              Disponible le 10 déc.
            </span>
          </div>
          <Sticker variant="torn" tone="blue" className="-top-[22px] -left-2.5 -rotate-[9deg] text-[15px]">
            Anonymisé
          </Sticker>
        </Pop>
      </section>
    </PageMotion>
  );
}
