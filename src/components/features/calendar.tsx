"use client";

import { useRef } from "react";

import { STEPS, type Step } from "@/config/challenge";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

type Status = "past" | "next" | "upcoming" | "tba";

function useStatuses(): Record<string, Status> {
  const now = useNow(30_000);
  const out: Record<string, Status> = {};
  const nextId = now === null ? null : STEPS.find((s) => s.at && Date.parse(s.at) > now)?.id;
  for (const s of STEPS) {
    if (!s.at) out[s.id] = "tba";
    else if (s.id === nextId) out[s.id] = "next";
    else if (now !== null && Date.parse(s.at) <= now) out[s.id] = "past";
    else out[s.id] = "upcoming";
  }
  return out;
}

const SKINS: Record<Status, { card: string; dot: string; label: string }> = {
  next: { card: "bg-kraken text-white shadow-[8px_8px_0_#000]", dot: "bg-kraken text-white", label: "PROCHAINE" },
  past: { card: "bg-paper text-ink shadow-[4px_4px_0_#000]", dot: "bg-ink text-white", label: "PASSÉE" },
  tba: { card: "bg-ink text-white shadow-[8px_8px_0_#0047FF]", dot: "bg-white text-ink", label: "À ANNONCER" },
  upcoming: { card: "bg-white text-ink shadow-[8px_8px_0_#000]", dot: "bg-white text-ink", label: "À VENIR" },
};

const TILTS = ["distort-soft-a", "distort-soft-b", "distort-soft-a", "distort-soft-b", "distort-soft-a", "distort-soft-b", "distort-soft-a"];

/**
 * Lève la card qui traverse le centre de l'écran : elle se surélève,
 * grossit et se redresse, puis se repose en sortant.
 */
function useScrollLift(scope: React.RefObject<HTMLElement | null>, selector: string, deps: unknown[] = []) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(selector, scope.current).forEach((el) => {
          const tl = gsap.timeline({ paused: true }).to(el, { y: -22, scale: 1.045, rotation: 0.8, duration: 0.45, ease: "back.out(2.4)" });
          ScrollTrigger.create({
            trigger: el,
            start: "top 62%",
            end: "bottom 38%",
            onToggle: (self) => (self.isActive ? tl.play() : tl.reverse()),
          });
        });
      });
      return () => mm.revert();
    },
    { scope, dependencies: deps, revertOnUpdate: true },
  );
}

/** Frise verticale du calendrier (page Calendrier). */
export function CalendarTimeline() {
  const root = useRef<HTMLDivElement>(null);
  const statuses = useStatuses();
  useScrollLift(root, "[data-lift]");

  return (
    <div ref={root} className="flex flex-col gap-7">
      {STEPS.map((s: Step, i) => {
        const skin = SKINS[statuses[s.id]];
        return (
          <div key={s.id} data-reveal className="flex items-stretch gap-4 sm:gap-6">
            <div className="flex w-12 flex-none flex-col items-center sm:w-14">
              <span className={cn("flex size-12 items-center justify-center rounded-full border-[3px] border-ink text-lg font-extrabold sm:size-14", skin.dot)}>
                {i + 1}
              </span>
              <span className="mt-1.5 w-0 flex-1 border-l-[3px] border-dashed border-ink" aria-hidden="true" />
            </div>
            <div data-lift className="min-w-0 flex-1 will-change-transform">
              <article
                className={cn(
                  "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-[24px] border-[3px] border-ink px-5 py-5 sm:rounded-[26px] sm:px-7",
                  TILTS[i],
                  skin.card,
                )}
              >
                <div className="flex min-w-0 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">{s.title}</h2>
                    <span className="rounded-full border-2 border-current px-2.5 py-1 text-[11px] font-extrabold tracking-[0.06em]">
                      {skin.label}
                    </span>
                  </div>
                  <p className="text-[15px] leading-normal font-semibold opacity-85">{s.desc}</p>
                </div>
                <div className="text-2xl font-extrabold tracking-[-0.02em] whitespace-nowrap sm:text-3xl">{s.shortDate}</div>
              </article>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const GRID_SKINS = [
  "bg-white text-ink shadow-[6px_6px_0_#000]",
  "bg-kraken text-white shadow-[6px_6px_0_#000]",
  "bg-ink text-white shadow-[6px_6px_0_#0047FF]",
  "bg-white text-ink shadow-[6px_6px_0_#000]",
  "bg-white text-ink shadow-[6px_6px_0_#000]",
];
const GRID_TILTS = ["distort-a", "distort-b", "distort-c", "distort-d", "distort-e"];

/** Grille compacte du calendrier (accueil) : 5 étapes clés, surélevées au scroll. */
export function CalendarGrid() {
  const root = useRef<HTMLDivElement>(null);
  useScrollLift(root, "[data-lift]");
  const steps = STEPS.filter((s) => ["close", "start", "deadline", "eval", "results"].includes(s.id));
  const subs: Record<string, string> = {
    close: "23 h 59 · annonce des lots",
    start: "Documentation publiée",
    deadline: "23 h 59 · verrouillage à la seconde",
    eval: "Banc de test automatique",
    results: "Contestations jusqu'au 10 déc.",
  };

  return (
    <div ref={root} className="grid grid-cols-1 gap-6 p-1.5 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((s, i) => (
        <div key={s.id} data-reveal>
          <div data-lift className="h-full will-change-transform">
            <div className={cn("flex h-full flex-col gap-2.5 rounded-3xl border-[3px] border-ink p-5", GRID_TILTS[i], GRID_SKINS[i])}>
              <div className={cn("text-[13px] font-extrabold tracking-[0.06em] uppercase", i === 0 || i > 2 ? "text-steel" : "")}>{s.title}</div>
              <div className="text-3xl leading-[1.05] font-extrabold tracking-[-0.02em]">{s.shortDate}</div>
              <div className={cn("text-sm font-semibold", i === 2 ? "text-mist" : i === 1 ? "" : "text-steel")}>{subs[s.id]}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
