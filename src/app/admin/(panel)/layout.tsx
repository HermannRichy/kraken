import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { adminLoginPath } from "@/lib/admin-path";
import { ROLE_LABELS, type Role } from "@/lib/permissions";
import { requireStaff } from "@/lib/server/session";

export const metadata: Metadata = { title: { default: "Administration", template: "%s · Admin Kraken" }, robots: { index: false, follow: false, nocache: true } };

async function Shell({ children }: { children: ReactNode }) {
  const { session, role } = await requireStaff(undefined, { allowWithout2fa: true });
  const items: NavItem[] = [
    { href: "/admin", label: "Tableau de bord", icon: "dashboard", group: "main" },
    { href: "/admin/participants", label: "Participants", icon: "participants", group: "main" },
    ...(role === "admin"
      ? ([
          { href: "/admin/equipe", label: "Équipe", icon: "team", group: "main" },
          { href: "/admin/reglages", label: "Réglages", icon: "settings", group: "main" },
        ] satisfies NavItem[])
      : []),
    { href: "/admin/securite", label: "Sécurité", icon: "security", group: "account" },
  ];
  return (
    <DashboardShell
      badge="ADMIN"
      home="/admin"
      items={items}
      groups={[
        { id: "main", label: "Pilotage" },
        { id: "account", label: "Compte" },
      ]}
      user={{ name: session.user.name, email: session.user.email, role: ROLE_LABELS[role as Role] }}
      signOutTo={adminLoginPath()}
    >
      {children}
    </DashboardShell>
  );
}

function ShellSkeleton() {
  return (
    <div data-admin-shell className="min-h-dvh bg-paper">
      <div className="fixed inset-x-0 top-0 h-16 border-b-[3px] border-ink bg-ink lg:inset-y-0 lg:right-auto lg:h-auto lg:w-[288px] lg:border-r-[3px] lg:border-b-0" />
      <div className="pt-16 lg:pt-0 lg:pl-[288px]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="h-12 w-64 animate-pulse rounded-2xl bg-white" />
          <div className="h-96 animate-pulse rounded-[24px] bg-white" />
        </div>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
