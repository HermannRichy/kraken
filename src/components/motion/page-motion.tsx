"use client";

import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";

import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Chef d'orchestre des animations de page, piloté par attributs data-* :
 * - data-reveal   : fondu + montée au scroll
 * - data-pop      : card qui « pop » (échelle, rotation, rebond) au scroll
 * - data-split    : titre découpé en lettres qui tombent
 * - data-slam     : bloc surligné qui s'écrase
 * - data-stamp    : sticker tamponné au scroll
 * - data-fill     : barre qui se remplit au scroll
 * - data-float    : dessins SVG animés en boucle (burst, star, squiggle, arrow)
 * - data-marquee  : bandeau défilant infini ("reverse" pour l'autre sens)
 * - data-tilt     : élément qui se redresse au scroll (scrub)
 */
export function PageMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Titres découpés
        q("[data-split]").forEach((el: HTMLElement) => {
          const split = SplitText.create(el, { type: "words,chars", wordsClass: "inline-block" });
          gsap.from(split.chars, {
            yPercent: -130,
            rotation: () => gsap.utils.random(-25, 25),
            autoAlpha: 0,
            duration: 0.75,
            ease: "back.out(2)",
            stagger: 0.025,
          });
        });

        // Blocs surlignés
        q("[data-slam]").forEach((el: HTMLElement, i: number) => {
          gsap.from(el, {
            scale: 2.2,
            rotation: -14,
            autoAlpha: 0,
            duration: 0.7,
            ease: "back.out(2.2)",
            delay: 0.45 + i * 0.1,
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });

        // Reveal
        gsap.set(q("[data-reveal]"), { autoAlpha: 0, y: 40 });
        ScrollTrigger.batch(q("[data-reveal]"), {
          start: "top 90%",
          once: true,
          onEnter: (els) =>
            gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, overwrite: true }),
        });

        // Pop des cards
        gsap.set(q("[data-pop]"), {
          autoAlpha: 0,
          scale: 0.6,
          y: 80,
          rotation: () => gsap.utils.random(-10, 10),
        });
        ScrollTrigger.batch(q("[data-pop]"), {
          start: "top 92%",
          once: true,
          onEnter: (els) =>
            gsap.to(els, {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              rotation: 0,
              duration: 0.9,
              ease: "back.out(1.6)",
              stagger: 0.1,
              overwrite: "auto",
            }),
        });

        // Stickers tamponnés
        q("[data-stamp]").forEach((el: HTMLElement) => {
          gsap.from(el, {
            scale: 2.4,
            autoAlpha: 0,
            duration: 0.55,
            ease: "back.out(2.5)",
            delay: 0.35,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        // Barres
        q("[data-fill]").forEach((el: HTMLElement) => {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.1,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });

        // Redressement au scroll
        q("[data-tilt]").forEach((el: HTMLElement) => {
          gsap.fromTo(
            el,
            { rotation: Number(el.dataset.tilt || -4) },
            {
              rotation: 0,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "center center", scrub: 1 },
            },
          );
        });

        // Dessins en boucle
        (q("[data-float]") as unknown as SVGElement[]).forEach((el) => {
          const kind = el.getAttribute("data-float");
          const delay = gsap.utils.random(0, 1.2);
          if (kind === "burst") {
            gsap.to(el, { scale: 1.18, rotation: 10, duration: 0.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay });
          } else if (kind === "star") {
            gsap.to(el, { rotation: 360, duration: 6, ease: "none", repeat: -1 });
            gsap.to(el, { scale: 0.75, duration: 0.9, ease: "sine.inOut", repeat: -1, yoyo: true, delay });
          } else if (kind === "squiggle") {
            const path = el.querySelector("path");
            if (path) {
              const len = path.getTotalLength();
              gsap.fromTo(
                path,
                { strokeDasharray: len, strokeDashoffset: len },
                { strokeDashoffset: -len, duration: 2.4, ease: "power1.inOut", repeat: -1, repeatDelay: 0.4, delay },
              );
            }
          } else if (kind === "arrow") {
            gsap.to(el, { x: 6, y: 6, duration: 0.7, ease: "sine.inOut", repeat: -1, yoyo: true, delay });
          }
        });

        // Bandeaux défilants
        q("[data-marquee]").forEach((el: HTMLElement) => {
          const track = el.firstElementChild as HTMLElement | null;
          if (!track) return;
          const reverse = el.dataset.marquee === "reverse";
          gsap.fromTo(
            track,
            { xPercent: reverse ? -50 : 0 },
            { xPercent: reverse ? 0 : -50, duration: Number(el.dataset.speed || 28), ease: "none", repeat: -1 },
          );
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(q("[data-reveal], [data-pop]"), { autoAlpha: 1 });
      });

      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div ref={scope} className="flex min-h-dvh flex-col">
      {children}
    </div>
  );
}
