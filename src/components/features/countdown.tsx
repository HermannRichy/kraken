"use client";

import { useEffect, useRef } from "react";

import { nextStep, STEPS } from "@/config/challenge";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

function Unit({ value, label, accent, size }: { value: string; label: string; accent?: boolean; size: "md" | "lg" }) {
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value || !ref.current || prefersReducedMotion()) {
      prev.current = value;
      return;
    }
    prev.current = value;
    gsap.fromTo(ref.current, { yPercent: -60, rotationX: 90, autoAlpha: 0 }, { yPercent: 0, rotationX: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" });
  }, [value]);

  return (
    <div
      className={cn(
        "rounded-[14px] text-center [perspective:400px]",
        size === "lg" ? "pt-3 pb-2.5" : "pt-2.5 pb-2",
        accent ? "bg-kraken text-white" : "bg-white text-ink",
      )}
    >
      <div ref={ref} className={cn("leading-none font-extrabold tabular-nums", size === "lg" ? "text-[40px]" : "text-[28px] sm:text-[34px]")}>
        {value}
      </div>
      <div className={cn("mt-1 text-[10px] font-extrabold sm:text-[11px]", accent ? "text-white" : "text-steel")}>{label}</div>
    </div>
  );
}

type Props = {
  /** Étape visée. Par défaut : la prochaine étape datée. */
  stepId?: string;
  size?: "md" | "lg";
  showTitle?: boolean;
};

export function Countdown({ stepId, size = "md", showTitle = false }: Props) {
  const now = useNow(1000);

  const fixed = stepId ? STEPS.find((s) => s.id === stepId) : undefined;
  const step = fixed ?? (now !== null ? nextStep(now) : STEPS.find((s) => s.at)!);
  const diff = now === null || !step.at ? null : Math.max(0, Math.floor((Date.parse(step.at) - now) / 1000));

  const d = diff === null ? "--" : pad(Math.floor(diff / 86400));
  const h = diff === null ? "--" : pad(Math.floor((diff % 86400) / 3600));
  const m = diff === null ? "--" : pad(Math.floor((diff % 3600) / 60));
  const s = diff === null ? "--" : pad(diff % 60);

  return (
    <div className="flex flex-col gap-3">
      {showTitle && <div className="text-2xl font-extrabold tracking-[-0.02em] sm:text-[28px]">{step.title}</div>}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5" role="timer" aria-label={`Temps restant avant : ${step.title}`}>
        <Unit value={d} label="JOURS" size={size} />
        <Unit value={h} label="HEURES" size={size} />
        <Unit value={m} label="MIN" size={size} />
        <Unit value={s} label="SEC" size={size} accent />
      </div>
      <div className="text-xs font-semibold text-mist sm:text-sm">{step.when} (heure du Bénin)</div>
    </div>
  );
}
