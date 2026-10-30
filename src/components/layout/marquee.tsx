"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  items: string[];
  className?: string;
  itemClassName?: string;
  separatorClassName?: string;
  reverse?: boolean;
  /** Durée d'un tour complet, en secondes. */
  speed?: number;
};

/** Bandeau défilant infini. */
export function Marquee({ items, className, itemClassName, separatorClassName = "text-kraken", reverse, speed = 28 }: Props) {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(track.current, { xPercent: reverse ? -50 : 0 }, { xPercent: reverse ? 0 : -50, duration: speed, ease: "none", repeat: -1 });
      });
      return () => mm.revert();
    },
    { scope: track, dependencies: [reverse, speed] },
  );

  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className={cn("flex items-center whitespace-nowrap", itemClassName)}>
          {item}
          <span className={cn("px-5", separatorClassName)} aria-hidden="true">
            ✶
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <div ref={track} className="flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
