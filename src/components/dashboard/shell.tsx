"use client";

import { Bell, BookOpen, ClipboardCheck, CreditCard, ExternalLink, FileStack, House, KeyRound, LayoutDashboard, Lock, LogOut, Menu, Settings, ShieldCheck, UserCog, UserRound, Users, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  participants: Users,
  team: UserCog,
  settings: Settings,
  security: ShieldCheck,
  home: House,
  payment: CreditCard,
  keys: KeyRound,
  docs: BookOpen,
  resources: FileStack,
  submissions: ClipboardCheck,
  bell: Bell,
  user: UserRound,
} satisfies Record<string, LucideIcon>;

export type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  group: string;
  /** Pastille à droite (ex. « À faire »). */
  badge?: string;
  /** Section pas encore disponible pour cet utilisateur (cadenas). */
  locked?: boolean;
};

type Props = {
  /** Libellé à côté du logo (ADMIN, ESPACE…). */
  badge: string;
  /** Page d'accueil de l'interface (lien du logo, onglet « exact »). */
  home: string;
  items: NavItem[];
  groups: { id: string; label: string }[];
  user: { name: string; email: string; role: string };
  /** Destination après déconnexion. */
  signOutTo: string;
  links?: { href: string; label: string }[];
  children: ReactNode;
};

const DESKTOP = "(min-width: 1024px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "K";

const isActive = (pathname: string, href: string, home: string) => (href === home ? pathname === home : pathname === href || pathname.startsWith(`${href}/`));

/** Interface type tableau de bord : barre latérale fixe sur grand écran, tiroir sur mobile et tablette. */
export function DashboardShell({ badge, home, items, groups, user, signOutTo, links = [{ href: "/", label: "Voir le site" }], children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const [signingOut, startSignOut] = useTransition();
  const closeRef = useRef<HTMLButtonElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );

  // Fermeture du tiroir à chaque changement de page.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open || desktop) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, desktop]);

  const current = items.find((it) => isActive(pathname, it.href, home))?.label ?? badge;
  const signOut = () =>
    startSignOut(async () => {
      await authClient.signOut();
      toast.success("Vous êtes déconnecté.");
      router.push(signOutTo);
      router.refresh();
    });

  return (
    <div data-admin-shell className="min-h-dvh bg-paper text-ink">
      {/* Barre supérieure (mobile et tablette) */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b-[3px] border-ink bg-ink px-3 text-white sm:px-5 lg:hidden">
        <button
          ref={burgerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          aria-controls="admin-sidebar"
          className="flex size-11 flex-none items-center justify-center rounded-[12px] border-[3px] border-white transition-colors hover:bg-white hover:text-ink"
        >
          <Menu size={22} strokeWidth={2.75} aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] leading-none font-extrabold tracking-[0.12em] text-mist">KRAKEN · {badge}</div>
          <div className="truncate text-[17px] leading-tight font-extrabold">{current}</div>
        </div>
        <span className="flex size-10 flex-none items-center justify-center rounded-full border-[3px] border-white bg-kraken text-sm font-extrabold" aria-hidden="true">
          {initials(user.name)}
        </span>
      </div>

      {/* Voile du tiroir */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn("fixed inset-0 z-40 bg-ink/60 transition-opacity duration-300 lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
      />

      {/* Barre latérale */}
      <aside
        id="admin-sidebar"
        aria-label={`Navigation ${badge.toLowerCase()}`}
        inert={!desktop && !open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[288px] max-w-[86vw] flex-col border-r-[3px] border-ink bg-ink text-white transition-transform duration-300 ease-out motion-reduce:transition-none lg:translate-x-0",
          open ? "translate-x-0 shadow-[8px_0_0_#0047FF]" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 flex-none items-center justify-between gap-3 border-b-[3px] border-white/15 px-5 lg:h-20">
          <Link href={home} className="flex items-center gap-2.5">
            <span className="text-2xl font-extrabold tracking-[-0.05em]">KRAKEN</span>
            <span className="rounded-full bg-kraken px-2.5 py-0.5 text-[11px] font-extrabold tracking-[0.08em]">{badge}</span>
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={() => {
              setOpen(false);
              burgerRef.current?.focus();
            }}
            aria-label="Fermer le menu"
            className="flex size-10 items-center justify-center rounded-[12px] border-[3px] border-white/40 hover:border-white lg:hidden"
          >
            <X size={20} strokeWidth={2.75} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-5">
          {groups.map((g) => {
            const list = items.filter((it) => it.group === g.id);
            if (!list.length) return null;
            return (
              <div key={g.id} className="mb-6 last:mb-0">
                <div className="mb-2 px-3 text-[11px] font-extrabold tracking-[0.12em] text-mist uppercase">{g.label}</div>
                <ul className="flex flex-col gap-1.5">
                  {list.map((it) => {
                    const Icon = ICONS[it.icon];
                    const active = isActive(pathname, it.href, home);
                    return (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-12 items-center gap-3 rounded-[14px] border-[3px] px-3 text-[15px] font-extrabold transition-[background-color,color,transform]",
                            active ? "border-white bg-white text-ink shadow-[4px_4px_0_#0047FF]" : "border-transparent text-white/85 hover:translate-x-0.5 hover:bg-white/10 hover:text-white",
                          )}
                        >
                          <Icon size={20} strokeWidth={2.5} aria-hidden="true" className="flex-none" />
                          <span className="min-w-0 flex-1 truncate">{it.label}</span>
                          {it.locked && <Lock size={15} strokeWidth={2.75} aria-label="Pas encore disponible" className={active ? "text-steel" : "text-mist"} />}
                          {it.badge && (
                            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-extrabold whitespace-nowrap", active ? "bg-kraken text-white" : "bg-white text-ink")}>{it.badge}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="flex flex-none flex-col gap-3 border-t-[3px] border-white/15 p-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-2 px-1 text-sm font-bold text-mist hover:text-white">
              <ExternalLink size={16} strokeWidth={2.5} aria-hidden="true" />
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 rounded-[16px] border-[3px] border-white/20 p-2.5">
            <span className="flex size-10 flex-none items-center justify-center rounded-full border-[3px] border-white bg-kraken text-sm font-extrabold" aria-hidden="true">
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-extrabold">{user.name}</div>
              <div className="truncate text-xs font-semibold text-mist">
                {user.role} · {user.email}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="flex min-h-11 items-center justify-center gap-2 rounded-[14px] border-[3px] border-white bg-white text-sm font-extrabold text-ink shadow-[3px_3px_0_#0047FF] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            <LogOut size={18} strokeWidth={2.5} aria-hidden="true" />
            {signingOut ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <div className="pt-16 lg:pt-0 lg:pl-[288px]">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
