"use client";

import { useRef, useState } from "react";

import { HoverContext, useHoverLift } from "@/components/motion/hover";
import { FAQ, FAQ_CATEGORIES, type FaqCategory } from "@/content/faq";
import { cn } from "@/lib/utils";

import { FaqList } from "./faq-list";

const TILTS = ["-rotate-2", "rotate-[1.5deg]", "-rotate-1", "rotate-2", "-rotate-[1.5deg]"];

function Tab({ label, on, onPick, i }: { label: string; on: boolean; onPick: () => void; i: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { hovered, handlers } = useHoverLift(ref, { y: -4, scale: 1.04 });
  return (
    <HoverContext.Provider value={hovered}>
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={on}
        onClick={onPick}
        {...handlers}
        className={cn(
          "min-h-12 rounded-2xl border-[3px] border-ink px-5 text-base font-extrabold transition-colors",
          TILTS[i],
          on ? "bg-ink text-white shadow-[5px_5px_0_#0047FF]" : "bg-white text-ink shadow-[4px_4px_0_#000]",
        )}
      >
        {label}
      </button>
    </HoverContext.Provider>
  );
}

/** FAQ complète filtrable par catégorie. */
export function FaqExplorer() {
  const [cat, setCat] = useState<FaqCategory | "all">("all");
  const items = FAQ.filter((f) => cat === "all" || f.c === cat).map(({ q, a }) => ({ q, a }));

  return (
    <div className="flex flex-col gap-10">
      <div role="tablist" aria-label="Catégories" className="flex flex-wrap gap-3" data-reveal>
        {FAQ_CATEGORIES.map((c, i) => (
          <Tab key={c.key} i={i} label={c.label} on={cat === c.key} onPick={() => setCat(c.key)} />
        ))}
      </div>
      <FaqList key={cat} items={items} />
    </div>
  );
}
