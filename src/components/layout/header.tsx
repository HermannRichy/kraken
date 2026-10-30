"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AnimatedIcon } from "@/components/motion/animated-icon";
import { HoverContext } from "@/components/motion/hover";
import { Button } from "@/components/ui/button";
import { NAV } from "@/config/challenge";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

import { Marquee } from "./marquee";

const TICKER = ["Inscriptions ouvertes", "100 places", "2 000 FCFA", "Solo", "Langage libre", "21 jours de dev"];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuHover, setMenuHover] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panel.current;
    if (!el || !open || prefersReducedMotion()) return;
    gsap.fromTo(el, { autoAlpha: 0, y: -20, scale: 0.95, rotation: -2 }, { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 0.45, ease: "back.out(2)" });
    gsap.fromTo(el.querySelectorAll("a"), { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, stagger: 0.05, duration: 0.35, delay: 0.1 });
  }, [open]);

  return (
    <header className="relative z-40 bg-white">
      <Marquee
        items={TICKER}
        speed={30}
        className="bg-ink py-2.5 text-[11px] font-extrabold tracking-[0.08em] text-white uppercase sm:text-[13px]"
      />
      <div className="border-b-[3px] border-ink">
        <nav
          aria-label="Navigation principale"
          className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10 lg:py-[18px]"
        >
          <Link href="/" aria-label="Kraken by HustlerLabs, accueil" className="flex">
            <Image src="/brand/kraken-horizontal-noir.svg" alt="Kraken by HustlerLabs" width={169} height={52} priority className="h-10 w-[130px] lg:h-[52px] lg:w-[169px]" />
          </Link>

          <div className="hidden items-center gap-1.5 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-[14px] border-[3px] px-3.5 text-[15px] font-bold transition-colors",
                    active
                      ? "-rotate-2 border-ink bg-ink font-extrabold text-white"
                      : "border-transparent hover:border-ink hover:bg-paper",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            <Button href="/#inscription" size="sm" icon="arrow-right" className="sm:min-h-12 sm:px-5 sm:text-base">
              S&apos;inscrire
            </Button>
            <button
              type="button"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              onMouseEnter={() => setMenuHover(true)}
              onMouseLeave={() => setMenuHover(false)}
              className="flex size-11 items-center justify-center rounded-[14px] border-[3px] border-ink bg-white shadow-[3px_3px_0_#000] lg:hidden"
            >
              <HoverContext.Provider value={menuHover || open}>
                <AnimatedIcon name={open ? "x" : "menu"} size={22} />
              </HoverContext.Provider>
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <div ref={panel} className="absolute inset-x-4 top-full mt-3 rounded-[26px] border-[3px] border-ink bg-white p-3 shadow-[8px_8px_0_#000] lg:hidden">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex min-h-14 items-center rounded-2xl px-4 text-lg font-extrabold",
                pathname === item.href ? "bg-ink text-white" : i % 2 ? "bg-white" : "bg-paper",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
