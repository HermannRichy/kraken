"use client";

import { createContext, useContext, useEffect, useRef, useState, type RefObject } from "react";

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
 * Soulève un élément au survol avec GSAP et renvoie l'état de survol
 * (à fournir au HoverContext pour déclencher les icônes).
 */
export function useHoverLift<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { y = -8, x = 0, scale = 1.03, rotation = 0, boxShadow }: LiftOptions = {},
) {
  const [hovered, setHovered] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReducedMotion()) return;
    gsap.to(el, {
      x: hovered ? x : 0,
      y: hovered ? y : 0,
      scale: hovered ? scale : 1,
      rotation: hovered ? rotation : 0,
      ...(boxShadow ? { boxShadow: hovered ? boxShadow[1] : boxShadow[0] } : {}),
      duration: hovered ? 0.35 : 0.55,
      ease: hovered ? "back.out(3)" : "elastic.out(1, 0.55)",
      overwrite: "auto",
    });
  }, [hovered, ref, x, y, scale, rotation, boxShadow]);

  return {
    hovered,
    handlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setHovered(true),
      onBlur: () => setHovered(false),
    },
  };
}
