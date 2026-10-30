"use client";

import { useEffect, useRef, useState } from "react";

import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

const TILTS = ["distort-soft-a", "distort-soft-b", "distort-soft-a", "distort-soft-b"];

type Props = {
  items: FaqItem[];
  /** Ouvre et ferme automatiquement la question qui passe au centre de l'écran. */
  autoOnScroll?: boolean;
  size?: "md" | "lg";
};

/**
 * FAQ en accordéon : apparition en cascade, ouverture/fermeture automatique au scroll
 * (la question au centre de l'écran s'ouvre, les autres se referment) et clic manuel.
 */
export function FaqList({ items, autoOnScroll = true, size = "lg" }: Props) {
  const [open, setOpen] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const mounted = useRef(false);

  // Hauteur des réponses
  useEffect(() => {
    const instant = !mounted.current || prefersReducedMotion();
    mounted.current = true;
    panels.current.forEach((panel, i) => {
      if (!panel) return;
      gsap.to(panel, {
        height: i === open ? "auto" : 0,
        autoAlpha: i === open ? 1 : 0,
        duration: instant ? 0 : 0.5,
        ease: i === open ? "back.out(1.4)" : "power3.inOut",
        onComplete: () => ScrollTrigger.refresh(),
      });
    });
  }, [open]);

  // Auto-ouverture au scroll
  useGSAP(
    () => {
      if (!autoOnScroll) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-faq-row]", root.current);
      rows.forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: "top 62%",
          end: "bottom 38%",
          onToggle: (self) => {
            if (self.isActive) setOpen(i);
          },
        });
      });
    },
    { scope: root, dependencies: [items, autoOnScroll], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="flex flex-col gap-4 sm:gap-[18px]">
      {items.map((item, i) => {
        const isOpen = i === open;
        return (
          <div key={item.q} data-faq-row data-reveal>
            <div
              className={cn(
                "overflow-hidden rounded-[18px] border-[3px] border-ink bg-white transition-shadow duration-300 sm:rounded-[22px]",
                TILTS[i % TILTS.length],
                isOpen ? "shadow-[8px_8px_0_#0047FF]" : "shadow-[6px_6px_0_#000]",
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 text-left font-extrabold text-ink",
                  size === "lg" ? "min-h-16 px-4 py-4 text-base sm:px-6 sm:text-[19px]" : "min-h-14 px-4 py-3.5 text-base",
                )}
              >
                <span>{item.q}</span>
                <span
                  className={cn(
                    "flex size-9 flex-none items-center justify-center rounded-full border-[3px] border-ink text-[22px] leading-none transition-[transform,background-color,color] duration-300",
                    isOpen ? "rotate-180 bg-kraken text-white" : "bg-white text-ink",
                  )}
                  aria-hidden="true"
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <div
                id={`faq-panel-${i}`}
                role="region"
                ref={(el) => {
                  panels.current[i] = el;
                }}
                className="overflow-hidden"
                style={i === 0 ? undefined : { height: 0, opacity: 0, visibility: "hidden" }}
              >
                <p className="px-4 pb-5 text-[15px] leading-relaxed font-semibold text-steel sm:px-6 sm:text-base">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
