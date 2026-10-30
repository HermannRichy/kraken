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
 * Enveloppe d'une card distordue : pop à l'apparition, soulèvement au survol,
 * et déclenchement des icônes animées qu'elle contient.
 * La distorsion CSS reste sur l'enfant : GSAP n'anime que cette enveloppe.
 */
export function Pop({ children, className, pop = true, lift = -10, scale = 1.03, rotation = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { hovered, handlers } = useHoverLift(ref, { y: lift, scale, rotation });

  return (
    <HoverContext.Provider value={hovered}>
      <div ref={ref} data-pop={pop ? "" : undefined} className={cn("group relative", className)} {...handlers}>
        {children}
      </div>
    </HoverContext.Provider>
  );
}
