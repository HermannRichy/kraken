import { Suspense } from "react";

import { InviteStaffForm, StaffRoleSelect } from "@/components/admin/staff-forms";
import { fmtDate, PageHeader, Panel } from "@/components/dashboard/ui";
import { db } from "@/lib/server/db";
import { requireStaff } from "@/lib/server/session";

async function Team() {
  const { session } = await requireStaff({ user: ["set-role"] });
  const staff = await db.user.findMany({ where: { role: { in: ["admin", "organizer", "jury"] } }, orderBy: { createdAt: "asc" } });
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Équipe" description="Administrateurs, organisateurs et jury." />
      <Panel title="Inviter un membre">
        <InviteStaffForm />
        <p className="text-sm text-steel">Le membre reçoit un lien pour définir son mot de passe, puis active la double authentification à la première connexion.</p>
      </Panel>
      <Panel title="Membres">
        <ul className="flex flex-col divide-y divide-mist">
          {staff.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="font-extrabold">{u.name}</div>
                <div className="text-sm text-steel">
                  <span className="break-all">{u.email}</span> · depuis {fmtDate(u.createdAt)} · 2FA {u.twoFactorEnabled ? "active" : "à activer"}
                </div>
              </div>
              <StaffRoleSelect userId={u.id} role={u.role ?? "organizer"} self={u.id === session.user.id} />
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}>
      <Team />
    </Suspense>
  );
}
