"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

import type { IconName } from "@/components/icons";
import { AnimatedIcon } from "@/components/motion/animated-icon";
import { HoverContext, useHoverLift } from "@/components/motion/hover";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const VARIANTS = {
  blue: { cls: "bg-kraken text-white", shadow: "#000" },
  white: { cls: "bg-white text-ink", shadow: "#000" },
  "white-on-dark": { cls: "bg-white text-ink", shadow: "#0047FF" },
  black: { cls: "bg-ink text-white", shadow: "#0047FF" },
  "black-on-blue": { cls: "bg-ink text-white", shadow: "#fff" },
} as const;

const SIZES = {
  sm: { cls: "min-h-11 px-4 text-sm gap-2 rounded-[14px]", rest: 3, hover: 6, icon: 18 },
  md: { cls: "min-h-12 px-5 text-base gap-2.5 rounded-2xl", rest: 5, hover: 9, icon: 20 },
  lg: { cls: "min-h-16 px-7 text-lg gap-3 rounded-[20px]", rest: 6, hover: 10, icon: 22 },
} as const;

type Props = {
  href: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  icon?: IconName;
  iconLeft?: IconName;
  className?: string;
  full?: boolean;
};

/** Bouton néo-brutaliste : se soulève au survol, s'écrase au clic, son icône s'anime. */
export function Button({ href, children, variant = "blue", size = "md", icon, iconLeft, className, full }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const rest = `${s.rest}px ${s.rest}px 0 ${v.shadow}`;
  const lifted = `${s.hover}px ${s.hover}px 0 ${v.shadow}`;
  const { hovered, handlers } = useHoverLift(ref, { x: -3, y: -3, scale: 1, boxShadow: [rest, lifted] });

  const press = (down: boolean) => {
    if (!ref.current || prefersReducedMotion()) return;
    gsap.to(ref.current, {
      x: down ? s.rest - 2 : -3,
      y: down ? s.rest - 2 : -3,
      boxShadow: down ? `0px 0px 0 ${v.shadow}` : lifted,
      duration: 0.12,
      ease: "power2.out",
    });
  };

  const classes = cn(
    "relative inline-flex items-center justify-center border-[3px] border-ink font-extrabold no-underline select-none",
    v.cls,
    s.cls,
    full && "w-full",
    className,
  );

  const content = (
    <HoverContext.Provider value={hovered}>
      {iconLeft && <AnimatedIcon name={iconLeft} size={s.icon} />}
      <span>{children}</span>
      {icon && <AnimatedIcon name={icon} size={s.icon} />}
    </HoverContext.Provider>
  );

  const shared = {
    ref,
    className: classes,
    style: { boxShadow: rest },
    onMouseDown: () => press(true),
    onMouseUp: () => press(false),
    ...handlers,
  };

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...shared}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} {...shared}>
      {content}
    </a>
  );
}
