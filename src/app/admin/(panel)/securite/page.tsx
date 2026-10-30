import { Suspense } from "react";

import { TwoFactorSetup } from "@/components/admin/staff-forms";
import { Panel } from "@/components/admin/ui";
import { requireStaff } from "@/lib/server/session";

async function Security() {
  const { session } = await requireStaff(undefined, { allowWithout2fa: true });
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">Sécurité</h1>
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
