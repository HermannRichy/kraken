import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader, Panel } from "@/components/dashboard/ui";
import { fmtDateTime } from "@/components/espace/status";
import { countryName } from "@/config/countries";
import { db } from "@/lib/server/db";
import { requireParticipant } from "@/lib/server/session";
import { LEVELS } from "@/lib/validation";

export const metadata: Metadata = { title: "Mon profil" };

const CONSENTS: Record<string, string> = { rules: "Règles et fair-play", terms: "Conditions de participation", data: "Traitement des données", public_name: "Nom affiché au classement" };

async function Profile() {
  const { participant } = await requireParticipant();
  const consents = await db.consent.findMany({ where: { participantId: participant.id }, orderBy: { acceptedAt: "asc" } });
  const rows: [string, string][] = [
    ["Nom complet", participant.fullName],
    ["E-mail", participant.email],
    ["Téléphone", participant.phone],
    ["GitHub", `@${participant.githubLogin}`],
    ["Lieu", `${participant.city}, ${countryName(participant.country)}`],
    ["Niveau", LEVELS.find((l) => l.value === participant.level)?.label ?? participant.level],
    ["Langage", participant.language || "-"],
    ["Inscrit le", fmtDateTime(participant.createdAt)],
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader title="Mon profil" description="Les informations de votre inscription." />
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Informations">
          <dl className="grid grid-cols-1 gap-y-0.5 text-[15px] sm:grid-cols-[auto_1fr] sm:gap-x-6 sm:gap-y-3">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="mt-3 font-bold text-steel first:mt-0 sm:mt-0">{k}</dt>
                <dd className="font-extrabold break-all">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="rounded-[14px] bg-paper p-3.5 text-[14px] font-semibold">
            Une erreur ?{" "}
            <Link href="/organisateur" className="font-extrabold underline underline-offset-4">
              Écrivez à l&apos;organisation
            </Link>
            , nous la corrigerons.
          </p>
        </Panel>
        <Panel title="Consentements" className="self-start">
          <ul className="flex flex-col gap-3">
            {consents.map((c) => (
              <li key={c.id} className="flex flex-col">
                <span className="text-[15px] font-extrabold">✓ {CONSENTS[c.kind]}</span>
                <span className="text-[13px] font-semibold text-steel">Accepté le {fmtDateTime(c.acceptedAt)}</span>
              </li>
            ))}
          </ul>
          {!participant.publicName && <p className="text-[13px] font-semibold text-steel">Au classement, vous apparaîtrez sous votre identifiant GitHub.</p>}
        </Panel>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}>
      <Profile />
    </Suspense>
  );
}
