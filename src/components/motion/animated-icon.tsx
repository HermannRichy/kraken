"use client";

import { useEffect, useRef } from "react";

import { ICONS, type AnimatedIconHandle, type IconName } from "@/components/icons";
import { cn } from "@/lib/utils";

import { useParentHover } from "./hover";

type Props = {
  name: IconName;
  size?: number;
  className?: string;
  /** Rejoue l'animation en boucle (ex. icône mise en avant). */
  loop?: number;
};

/** Icône lucide-animated qui s'anime quand sa card ou son bouton parent est survolé. */
export function AnimatedIcon({ name, size = 24, className, loop }: Props) {
  const Icon = ICONS[name];
  const ref = useRef<AnimatedIconHandle>(null);
  const hovered = useParentHover();

  useEffect(() => {
    if (hovered) ref.current?.startAnimation();
    else ref.current?.stopAnimation();
  }, [hovered]);

  useEffect(() => {
    if (!loop) return;
    const id = window.setInterval(() => ref.current?.startAnimation(), loop);
    return () => window.clearInterval(id);
  }, [loop]);

  return <Icon ref={ref} size={size} className={cn("pointer-events-none flex", className)} aria-hidden="true" />;
}
