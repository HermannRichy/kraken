import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/espace/small";
import { Container } from "@/components/ui/primitives";
import { ROLE_LABELS, type Role } from "@/lib/permissions";
import { requireStaff } from "@/lib/server/session";

export const metadata: Metadata = { title: { default: "Administration", template: "%s · Admin Kraken" }, robots: { index: false, follow: false } };

async function Bar() {
  const { session, role } = await requireStaff(undefined, { allowWithout2fa: true });
  const items = [
    { href: "/admin", label: "Tableau de bord" },
    { href: "/admin/participants", label: "Participants" },
    ...(role === "admin"
      ? [
          { href: "/admin/equipe", label: "Équipe" },
          { href: "/admin/reglages", label: "Réglages" },
        ]
      : []),
    { href: "/admin/securite", label: "Sécurité" },
  ];
  return (
    <div className="border-b-[3px] border-ink bg-ink text-white">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
        <AdminNav items={items} />
        <div className="flex items-center gap-3">
          <span className="text-right text-sm leading-tight">
            <span className="block font-extrabold">{session.user.name}</span>
            <span className="text-mist">{ROLE_LABELS[role as Role]}</span>
          </span>
          <SignOutButton redirectTo="/admin/connexion" />
        </div>
      </Container>
    </div>
  );
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-[76px] border-b-[3px] border-ink bg-ink" />}>
        <Bar />
      </Suspense>
      <div className="bg-paper">
        <Container className="py-10 lg:py-12">{children}</Container>
      </div>
    </>
  );
}
