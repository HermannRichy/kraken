import { Suspense } from "react";

import { TwoFactorSetup } from "@/components/admin/staff-forms";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { requireStaff } from "@/lib/server/session";

async function Security() {
  const { session } = await requireStaff(undefined, { allowWithout2fa: true });
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Sécurité" description="Protégez l'accès à votre compte." />
      <Panel title="Double authentification">
        <TwoFactorSetup enabled={Boolean(session.user.twoFactorEnabled)} />
      </Panel>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-[24px] bg-white" />}>
      <Security />
    </Suspense>
  );
}
