"use client";

import { useRef, type ReactNode } from "react";

import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Chef d'orchestre des animations d'une page, piloté par attributs data-* :
 * - data-reveal : fondu + montée quand l'élément entre à l'écran (rejoué en remontant)
 * - data-pop    : card qui « pop » (échelle, rotation, rebond) à l'entrée à l'écran
 * - data-split  : titre découpé en lettres qui tombent
 * - data-slam   : bloc surligné qui s'écrase
 * - data-stamp  : sticker tamponné à l'entrée à l'écran
 * - data-fill   : barre qui se remplit à l'entrée à l'écran
 * - data-float  : dessins SVG animés en boucle (burst, star, squiggle, arrow)
 *
 * À placer DANS chaque page (autour de son contenu) : ses effets ne tournent
 * qu'une fois toute la page hydratée, sinon React écraserait les états initiaux.
 */
export function PageMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Titres découpés
        q("[data-split]").forEach((el: HTMLElement) => {
          SplitText.create(el, {
            type: "words,chars",
            wordsClass: "inline-block",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                yPercent: -130,
                rotation: () => gsap.utils.random(-25, 25),
                autoAlpha: 0,
                duration: 0.75,
                ease: "back.out(2)",
                stagger: 0.025,
              }),
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
            scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none none" },
          });
        });

        // Reveal (rejoué en remontant)
        const reveals = q("[data-reveal]");
        gsap.set(reveals, { autoAlpha: 0, y: 48 });
        ScrollTrigger.batch(reveals, {
          start: "top 88%",
          onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, overwrite: true }),
          onLeaveBack: (els) => gsap.to(els, { autoAlpha: 0, y: 48, duration: 0.3, ease: "power1.in", overwrite: true }),
        });

        // Pop des cards (rejoué en remontant)
        const pops = q("[data-pop]");
        gsap.set(pops, { autoAlpha: 0, scale: 0.55, y: 90, rotation: () => gsap.utils.random(-12, 12) });
        ScrollTrigger.batch(pops, {
          start: "top 90%",
          onEnter: (els) =>
            gsap.to(els, { autoAlpha: 1, scale: 1, y: 0, rotation: 0, duration: 0.9, ease: "back.out(1.7)", stagger: 0.12, overwrite: true }),
          onLeaveBack: (els) =>
            gsap.to(els, { autoAlpha: 0, scale: 0.55, y: 90, rotation: () => gsap.utils.random(-12, 12), duration: 0.35, ease: "power2.in", overwrite: true }),
        });

        // Stickers tamponnés
        q("[data-stamp]").forEach((el: HTMLElement) => {
          gsap.from(el, {
            scale: 2.6,
            autoAlpha: 0,
            duration: 0.55,
            ease: "back.out(2.5)",
            delay: 0.4,
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
          });
        });

        // Barres
        q("[data-fill]").forEach((el: HTMLElement) => {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.1,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" },
          });
        });

        // Dessins en boucle
        (q("[data-float]") as unknown as SVGElement[]).forEach((el) => {
          const kind = el.getAttribute("data-float");
          const delay = gsap.utils.random(0, 1.2);
          if (kind === "burst") {
            gsap.to(el, { scale: 1.2, rotation: 10, duration: 0.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay });
          } else if (kind === "star") {
            gsap.to(el, { rotation: 360, duration: 6, ease: "none", repeat: -1 });
            gsap.to(el, { scale: 0.72, duration: 0.9, ease: "sine.inOut", repeat: -1, yoyo: true, delay });
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
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(q("[data-reveal], [data-pop]"), { autoAlpha: 1 });
      });

      // Recalcule les positions quand polices et images ont fini de charger.
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener("load", refresh);
      const t = window.setTimeout(refresh, 400);

      return () => {
        window.removeEventListener("load", refresh);
        window.clearTimeout(t);
        mm.revert();
      };
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
