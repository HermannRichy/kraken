import type { ReactNode } from "react";

import { Pop } from "@/components/motion/pop";
import { Button } from "@/components/ui/button";
import { Burst } from "@/components/ui/doodles";
import type { IconName } from "@/components/icons";
import { cn } from "@/lib/utils";

type Props = {
  title: ReactNode;
  text?: ReactNode;
  href: string;
  label: string;
  icon?: IconName;
  tone?: "blue" | "black";
};

/** Bandeau d'appel à l'action en fin de page. */
export function CtaBand({ title, text, href, label, icon = "arrow-right", tone = "blue" }: Props) {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
      <Pop className="mx-auto max-w-[1200px]" lift={-6} scale={1.01}>
        <div
          className={cn(
            "distort-soft-a flex flex-wrap items-center justify-between gap-6 rounded-[30px] border-4 border-ink p-7 sm:p-10 lg:rounded-[36px] lg:px-12 lg:py-11",
            tone === "blue" ? "bg-kraken text-white shadow-[12px_12px_0_#000]" : "bg-ink text-white shadow-[12px_12px_0_#0047FF]",
          )}
        >
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-3">
            <h2 className="text-3xl leading-[1.05] font-extrabold tracking-[-0.03em] lg:text-[40px]">{title}</h2>
            {text && <p className={cn("text-base leading-relaxed font-semibold lg:text-[17px]", tone === "black" && "text-mist")}>{text}</p>}
          </div>
          <Button href={href} variant={tone === "black" ? "white-on-dark" : "white"} size="lg" icon={icon}>
            {label}
          </Button>
        </div>
        <Burst flip size={44} className="-top-7 -right-3" />
      </Pop>
    </section>
  );
}
