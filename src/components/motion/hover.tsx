"use client";

import { createContext, useCallback, useContext, useState, type RefObject } from "react";

import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** Indique aux icônes animées que leur parent (card, bouton) est survolé. */
export const HoverContext = createContext(false);

export const useParentHover = () => useContext(HoverContext);

type LiftOptions = {
  y?: number;
  x?: number;
  scale?: number;
  rotation?: number;
  boxShadow?: [string, string];
};

/**
 * Soulève un élément au survol avec GSAP (déclenché par les événements, jamais au montage)
 * et renvoie l'état de survol à fournir au HoverContext pour animer les icônes.
 */
export function useHoverLift<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { y = -8, x = 0, scale = 1.03, rotation = 0, boxShadow }: LiftOptions = {},
) {
  const [hovered, setHovered] = useState(false);

  const animate = useCallback(
    (on: boolean) => {
      setHovered(on);
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.to(el, {
        x: on ? x : 0,
        y: on ? y : 0,
        scale: on ? scale : 1,
        rotation: on ? rotation : 0,
        ...(boxShadow ? { boxShadow: on ? boxShadow[1] : boxShadow[0] } : {}),
        duration: on ? 0.35 : 0.6,
        ease: on ? "back.out(3)" : "elastic.out(1, 0.55)",
        overwrite: "auto",
      });
    },
    [ref, x, y, scale, rotation, boxShadow],
  );

  return {
    hovered,
    handlers: {
      onMouseEnter: () => animate(true),
      onMouseLeave: () => animate(false),
      onFocus: () => animate(true),
      onBlur: () => animate(false),
    },
  };
}
