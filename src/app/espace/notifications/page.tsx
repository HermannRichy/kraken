import type { Metadata } from "next";

import { PageHeader, Panel } from "@/components/dashboard/ui";
import { PushSettings } from "@/components/espace/push-settings";

export const metadata: Metadata = { title: "Notifications" };

const EVENTS = [
  ["Paiement", "Confirmation ou échec de votre paiement."],
  ["Liste d'attente", "Une place se libère pour vous."],
  ["Ouverture du défi", "Le sujet et la documentation sont en ligne."],
  ["Rappels", "Avant la date limite de livraison."],
  ["Résultats", "Votre évaluation est disponible."],
];

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader title="Notifications" description="Soyez prévenu en direct, même navigateur fermé." />
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Cet appareil">
          <PushSettings vapidKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY} />
        </Panel>
        <Panel title="Vous serez prévenu pour" className="self-start">
          <ul className="flex flex-col gap-3">
            {EVENTS.map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-1.5 size-2.5 flex-none rounded-full bg-kraken" aria-hidden="true" />
                <span className="text-[15px] font-semibold">
                  <strong className="font-extrabold">{t}</strong> · {d}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] font-semibold text-steel">Les e-mails importants restent envoyés dans tous les cas.</p>
        </Panel>
      </div>
    </div>
  );
}
