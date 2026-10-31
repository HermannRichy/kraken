import { Suspense } from "react";

import { SeatsCapForm } from "@/components/admin/staff-forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { getSeatsCap } from "@/lib/server/participants";
import { isMockMode } from "@/lib/server/feexpay";
import { requireStaff } from "@/lib/server/session";
import { turnstileEnabled } from "@/lib/server/turnstile";
import { adminGate } from "@/lib/admin-path";

async function Settings() {
  await requireStaff({ settings: ["update"] });
  const cap = await getSeatsCap();
  const checks = [
    ["Envoi d'e-mails (Brevo)", Boolean(process.env.BREVO_API_KEY)],
    ["Paiement FeexPay (mode réel)", !isMockMode() && Boolean(process.env.FEEXPAY_API_KEY && process.env.FEEXPAY_SHOP_ID)],
    ["Secret du webhook FeexPay", Boolean(process.env.FEEXPAY_WEBHOOK_SECRET)],
    ["Notifications push (VAPID)", Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)],
    ["Tâche de réconciliation (CRON_SECRET)", Boolean(process.env.CRON_SECRET)],
    ["Anti-robot Cloudflare Turnstile", turnstileEnabled()],
    ["Adresse de connexion secrète (ADMIN_PATH)", Boolean(adminGate())],
  ] as const;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Réglages" description="Places et état de la configuration." />
      <Panel title="Places">
        <SeatsCapForm value={cap} />
        <p className="text-sm text-steel">Au-delà du plafond, les nouveaux paiements basculent automatiquement en liste d&apos;attente.</p>
      </Panel>
      <Panel title="Configuration">
        <ul className="flex flex-col gap-2">
          {checks.map(([label, ok]) => (
            <li key={label} className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-sm font-bold">
              <span>{label}</span>
              <span className={ok ? "text-kraken" : "text-[#C62828]"}>{ok ? "✓ Configuré" : "✗ À configurer"}</span>
            </li>
          ))}
        </ul>
        {isMockMode() && <p className="rounded-xl bg-[#FFF4E5] p-3 text-sm font-bold">FeexPay est en mode simulation (FEEXPAY_MODE=mock) : aucun paiement réel n&apos;est encaissé.</p>}
      </Panel>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}>
      <Settings />
    </Suspense>
  );
}
