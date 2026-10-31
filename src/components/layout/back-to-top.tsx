"use client";

import { useEffect, useRef } from "react";

import { AnimatedIcon } from "@/components/motion/animated-icon";
import { HoverContext, useHoverLift } from "@/components/motion/hover";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useScrollDirection } from "@/lib/use-scroll-direction";

/** Bouton « retour en haut » : apparaît quand on remonte la page, disparaît quand on redescend. */
export function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null);
  const { direction, y } = useScrollDirection();
  const visible = direction === "up" && y > 500;
  const { hovered, handlers } = useHoverLift(ref, { x: -3, y: -3, scale: 1.06, boxShadow: ["5px 5px 0 #000", "9px 9px 0 #000"] });
  const shown = useRef(false);

  useEffect(() => {
    if (ref.current) gsap.set(ref.current, { scale: 0.4, rotation: -20, y: 30 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown.current === visible) return;
    shown.current = visible;
    const instant = prefersReducedMotion();
    gsap.to(el, visible
      ? { autoAlpha: 1, scale: 1, rotation: 0, y: 0, duration: instant ? 0 : 0.5, ease: "back.out(2.4)", overwrite: "auto" }
      : { autoAlpha: 0, scale: 0.4, rotation: -20, y: 30, duration: instant ? 0 : 0.3, ease: "power2.in", overwrite: "auto" });
  }, [visible]);

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <HoverContext.Provider value={hovered}>
      <button
        ref={ref}
        type="button"
        onClick={toTop}
        aria-label="Revenir en haut de la page"
        tabIndex={visible ? 0 : -1}
        {...handlers}
        style={{ boxShadow: "5px 5px 0 #000", opacity: 0, visibility: "hidden" }}
        className="site-chrome fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-[18px] border-[3px] border-ink bg-kraken text-white sm:right-6 sm:bottom-6 sm:size-16"
      >
        <AnimatedIcon name="arrow-up" size={26} loop={visible ? 2600 : undefined} />
      </button>
    </HoverContext.Provider>
  );
}
