import type { ReactNode } from "react";

import { Container } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Props = {
  chip: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
  tone?: "paper" | "black" | "blue";
  className?: string;
  children?: ReactNode;
};

const TONES = {
  paper: "bg-paper text-ink",
  black: "bg-ink text-white",
  blue: "bg-kraken text-white",
} as const;

/** En-tête des pages internes : pastille, grand titre avec mot surligné, intro et visuel. */
export function PageHero({ chip, title, intro, aside, tone = "paper", className, children }: Props) {
  return (
    <section className={cn("relative border-b-[3px] border-ink", TONES[tone], className)}>
      <Container className="flex flex-wrap items-center gap-12 pt-14 pb-16 lg:gap-14 lg:pt-20 lg:pb-24">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-6 lg:gap-7">
          {chip}
          <h1 className="text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[80px] lg:leading-[0.98]">
            {title}
          </h1>
          {intro && (
            <p
              data-reveal
              className={cn(
                "max-w-[620px] text-[17px] leading-normal font-semibold sm:text-xl",
                tone === "black" ? "text-mist" : "",
              )}
            >
              {intro}
            </p>
          )}
          {children}
        </div>
        {aside && <div className="relative min-w-0 flex-[1_1_380px]">{aside}</div>}
      </Container>
    </section>
  );
}
