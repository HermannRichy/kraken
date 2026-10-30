import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Burst, Squiggle, Star } from "./doodles";

/** Pastille de section (« 01 · LE DÉFI ») avec son petit dessin. */
export function Chip({
  children,
  dark = false,
  doodle = "burst",
  className,
}: {
  children: ReactNode;
  dark?: boolean;
  doodle?: "burst" | "star" | "squiggle" | "star-blue" | "none";
  className?: string;
}) {
  const c = dark ? "#fff" : "#000";
  return (
    <span
      data-reveal
      className={cn(
        "relative inline-flex self-start rounded-full border-[3px] px-3.5 py-1.5 text-xs font-extrabold tracking-[0.08em] uppercase sm:text-[13px]",
        dark ? "border-white text-white" : "border-ink bg-white text-ink",
        className,
      )}
    >
      {children}
      {doodle === "burst" && <Burst color={c} size={32} className="-top-5 -right-10" />}
      {doodle === "star" && <Star color={c} size={22} className="-top-3.5 -right-7" />}
      {doodle === "star-blue" && <Star color="#0047FF" size={22} className="-top-3.5 -right-7" />}
      {doodle === "squiggle" && <Squiggle color={c} width={100} className="-bottom-5 left-0" />}
    </span>
  );
}

/** Bloc de mot surligné, distordu, qui « s'écrase » à l'apparition. */
export function Highlight({
  children,
  tone = "blue",
  className,
  doodle,
}: {
  children: ReactNode;
  tone?: "blue" | "black" | "white" | "blue-dark";
  className?: string;
  doodle?: ReactNode;
}) {
  const tones = {
    blue: "bg-kraken text-white border-ink shadow-[8px_8px_0_#000]",
    black: "bg-ink text-white border-ink shadow-[8px_8px_0_#0047FF]",
    white: "bg-white text-ink border-ink shadow-[8px_8px_0_#000]",
    "blue-dark": "bg-kraken text-white border-white shadow-[8px_8px_0_#fff]",
  } as const;
  return (
    <span data-slam className="inline-block">
      <span
        className={cn(
          "distort-title relative inline-block rounded-[20px] border-[3px] px-3 pb-1.5 sm:rounded-3xl sm:border-4 sm:px-4 sm:pb-2",
          tones[tone],
          className,
        )}
      >
        {children}
        {doodle}
      </span>
    </span>
  );
}

/** Sticker : étiquette à bordure ou papier déchiré. */
export function Sticker({
  children,
  variant = "tag",
  tone = "white",
  className,
}: {
  children: ReactNode;
  variant?: "tag" | "torn";
  tone?: "white" | "blue" | "black";
  className?: string;
}) {
  const tones = {
    white: "bg-white text-ink",
    blue: "bg-kraken text-white",
    black: "bg-ink text-white",
  } as const;
  return (
    <div
      data-stamp
      className={cn(
        "pointer-events-none absolute z-10 text-center leading-[0.95] font-extrabold uppercase",
        variant === "tag"
          ? "rounded-[14px] border-[3px] border-ink px-3.5 py-2.5 shadow-[4px_4px_0_#000]"
          : "torn px-4 py-3.5",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Rond d'icône des cards (inspiré des cards « action »). */
export function IconDot({ children, tone = "black", className }: { children: ReactNode; tone?: "black" | "white" | "blue"; className?: string }) {
  const tones = { black: "bg-ink text-white", white: "bg-white text-ink", blue: "bg-kraken text-white" } as const;
  return (
    <span className={cn("flex size-14 flex-none items-center justify-center rounded-full sm:size-16", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10", className)}>{children}</div>;
}

export function H2({ children, className, dark }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <h2
      data-reveal
      className={cn(
        "relative text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-[56px] lg:leading-none",
        dark ? "text-white" : "text-ink",
        className,
      )}
    >
      {children}
    </h2>
  );
}
