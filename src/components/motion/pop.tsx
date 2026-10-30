"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { HoverContext, useHoverLift } from "./hover";

type Props = {
  children: ReactNode;
  className?: string;
  /** Apparition en « pop » au scroll (gérée par PageMotion). */
  pop?: boolean;
  lift?: number;
  scale?: number;
  rotation?: number;
};

/**
 * Enveloppe d'une card distordue.
 * - couche externe : pop à l'apparition au scroll (PageMotion)
 * - couche interne : soulèvement au survol + déclenchement des icônes animées
 * La distorsion CSS reste sur l'enfant : GSAP n'anime que ces deux couches,
 * qui ne se gênent jamais.
 */
export function Pop({ children, className, pop = true, lift = -10, scale = 1.03, rotation = 0 }: Props) {
  const inner = useRef<HTMLDivElement>(null);
  const { hovered, handlers } = useHoverLift(inner, { y: lift, scale, rotation });

  return (
    <HoverContext.Provider value={hovered}>
      <div data-pop={pop ? "" : undefined} className={cn("group relative", className)}>
        <div ref={inner} className="relative h-full" {...handlers}>
          {children}
        </div>
      </div>
    </HoverContext.Provider>
  );
}
