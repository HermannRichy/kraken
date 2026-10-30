"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type Item = { href: string; label: string };

export function AdminNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-[14px] border-[3px] px-4 text-[15px] font-extrabold transition-colors",
              active ? "border-white bg-white text-ink" : "border-white/40 text-white hover:border-white",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
