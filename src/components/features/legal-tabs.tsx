"use client";

import { useRef, useState } from "react";

import { AnimatedIcon } from "@/components/motion/animated-icon";
import { HoverContext, useHoverLift } from "@/components/motion/hover";
import { Star } from "@/components/ui/doodles";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type LegalSection = { label: string; blocks: { h: string; p: string }[] };

const TILTS = ["-rotate-[1.5deg]", "rotate-1", "-rotate-1"];

function TabButton({ label, on, onPick, i }: { label: string; on: boolean; onPick: () => void; i: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { hovered, handlers } = useHoverLift(ref, { x: 6, y: 0, scale: 1.02 });
  return (
    <HoverContext.Provider value={hovered}>
      <button
        ref={ref}
        type="button"
        aria-pressed={on}
        onClick={onPick}
        {...handlers}
        className={cn(
          "flex min-h-[60px] items-center justify-between gap-3 rounded-[18px] border-[3px] border-ink px-5 text-left text-[17px] font-extrabold transition-colors",
          TILTS[i],
          on ? "bg-ink text-white shadow-[6px_6px_0_#0047FF]" : "bg-white text-ink shadow-[5px_5px_0_#000]",
        )}
      >
        <span>{label}</span>
        <AnimatedIcon name="arrow-right" size={20} />
      </button>
    </HoverContext.Provider>
  );
}

/** Mentions, conditions et données personnelles en onglets. */
export function LegalTabs({ sections }: { sections: LegalSection[] }) {
  const [tab, setTab] = useState(0);
  const panel = useRef<HTMLElement>(null);
  const current = sections[tab];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(panel.current, { rotation: -2, y: 24, autoAlpha: 0.4 }, { rotation: 0, y: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.8)" });
      gsap.fromTo("[data-legal-block]", { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, stagger: 0.06, duration: 0.4, delay: 0.1 });
    },
    { dependencies: [tab], scope: panel },
  );

  return (
    <div className="flex flex-wrap items-start gap-12">
      <nav aria-label="Sections" className="flex w-full flex-none flex-col gap-3.5 lg:w-[300px]" data-reveal>
        {sections.map((s, i) => (
          <TabButton key={s.label} i={i} label={s.label} on={tab === i} onPick={() => setTab(i)} />
        ))}
      </nav>
      <div className="relative min-w-0 flex-[999_1_560px]">
        <article
          ref={panel}
          className="flex flex-col gap-6 rounded-[32px] border-4 border-ink bg-white p-6 shadow-[12px_12px_0_#000] sm:p-10"
        >
          <h2 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-[40px]">{current.label}</h2>
          {current.blocks.map((b) => (
            <div key={b.h} data-legal-block className="flex flex-col gap-2 border-b-[3px] border-dashed border-mist pb-5">
              <h3 className="text-xl font-extrabold">{b.h}</h3>
              <p className="text-base leading-[1.65] font-semibold text-[#3a3d44]">{b.p}</p>
            </div>
          ))}
        </article>
        <Star size={40} color="#0047FF" className="-top-6 -right-4" />
      </div>
    </div>
  );
}
