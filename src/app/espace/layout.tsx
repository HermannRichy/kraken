import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { PushPrompt } from "@/components/espace/push-prompt";
import { WelcomeToast } from "@/components/espace/small";
import { hasKeys, STATUS } from "@/components/espace/status";
import { requireParticipant } from "@/lib/server/session";

export const metadata: Metadata = { title: { default: "Mon espace", template: "%s · Mon espace Kraken" }, robots: { index: false, follow: false, nocache: true } };

async function Shell({ children }: { children: ReactNode }) {
  const { session, participant } = await requireParticipant();
  const s = participant.status;
  const items: NavItem[] = [
    { href: "/espace", label: "Accueil", icon: "home", group: "main" },
    {
      href: "/espace/paiement",
      label: "Paiement",
      icon: "payment",
      group: "main",
      badge: s === "email_confirmed" ? "À faire" : s === "payment_pending" ? "En cours" : undefined,
      locked: s === "pre_registered",
    },
    { href: "/espace/cles", label: "Mes clés", icon: "keys", group: "main", locked: !hasKeys(s), badge: hasKeys(s) ? "Prêtes" : undefined },
    { href: "/espace/documentation", label: "Documentation", icon: "docs", group: "main" },
    { href: "/espace/notifications", label: "Notifications", icon: "bell", group: "account" },
    { href: "/espace/profil", label: "Mon profil", icon: "user", group: "account" },
  ];
  const staff = session.user.role === "admin" || session.user.role === "moderator";
  return (
    <DashboardShell
      badge="ESPACE"
      home="/espace"
      items={items}
      groups={[
        { id: "main", label: "Mon défi" },
        { id: "account", label: "Compte" },
      ]}
      user={{ name: participant.fullName, email: participant.email, role: STATUS[s]?.label ?? "Participant" }}
      signOutTo="/"
      links={[{ href: "/", label: "Voir le site" }, ...(staff ? [{ href: "/admin", label: "Administration" }] : [])]}
    >
      <WelcomeToast />
      <PushPrompt vapidKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY} />
      {children}
    </DashboardShell>
  );
}

function ShellSkeleton() {
  return (
    <div data-admin-shell className="min-h-dvh bg-paper" aria-busy="true">
      <div className="fixed inset-x-0 top-0 h-16 border-b-[3px] border-ink bg-ink lg:inset-y-0 lg:right-auto lg:h-auto lg:w-[288px] lg:border-r-[3px] lg:border-b-0" />
      <div className="pt-16 lg:pt-0 lg:pl-[288px]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="h-12 w-64 animate-pulse rounded-2xl bg-white" />
          <div className="h-28 animate-pulse rounded-[24px] bg-white" />
          <div className="h-80 animate-pulse rounded-[24px] bg-white" />
        </div>
      </div>
    </div>
  );
}

export default function EspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
