import { Suspense } from "react";

import { PageHeader, Panel, Stat, STATUS_LABELS } from "@/components/admin/ui";
import { countryName } from "@/config/countries";
import { LEVELS } from "@/lib/validation";
import { db } from "@/lib/server/db";
import { countTakenSeats, getSeatsCap } from "@/lib/server/participants";
import { requireStaff } from "@/lib/server/session";

async function Dashboard() {
  await requireStaff({ participant: ["read"] });
  // eslint-disable-next-line react-hooks/purity -- composant serveur rendu à chaque requête
  const since = new Date(Date.now() - 13 * 86400_000);
  since.setHours(0, 0, 0, 0);

  const [byStatus, byCountry, byLevel, daily, paidSum, cap, taken, emailsFailed] = await Promise.all([
    db.participant.groupBy({ by: ["status"], _count: true }),
    db.participant.groupBy({ by: ["country"], _count: true, orderBy: { _count: { country: "desc" } }, take: 8 }),
    db.participant.groupBy({ by: ["level"], _count: true }),
    db.$queryRaw<{ day: Date; n: bigint }[]>`SELECT date_trunc('day', "createdAt" AT TIME ZONE 'Africa/Porto-Novo') AS day, COUNT(*) AS n FROM "Participant" WHERE "createdAt" >= ${since} GROUP BY 1 ORDER BY 1`,
    db.payment.aggregate({ where: { status: "succeeded" }, _sum: { amount: true }, _count: true }),
    getSeatsCap(),
    countTakenSeats(),
    db.emailLog.count({ where: { status: "failed", createdAt: { gte: since } } }),
  ]);

  const count = (s: string) => byStatus.find((b) => b.status === s)?._count ?? 0;
  const total = byStatus.reduce((a, b) => a + b._count, 0);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86400_000);
    const key = d.toISOString().slice(0, 10);
    const row = daily.find((r) => new Date(r.day).toISOString().slice(0, 10) === key);
    return { label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), n: Number(row?.n ?? 0) };
  });
  const max = Math.max(1, ...days.map((d) => d.n));

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader title="Tableau de bord" description="Vue d'ensemble des inscriptions et des paiements." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Inscriptions" value={total} />
        <Stat label="Inscrits payés" value={count("registered")} tone="blue" />
        <Stat label="Places restantes" value={Math.max(0, cap - taken)} tone="black" hint={`sur ${cap}`} />
        <Stat label="E-mails non confirmés" value={count("pre_registered")} />
        <Stat label="Encaissé" value={`${(paidSum._sum.amount ?? 0).toLocaleString("fr-FR")} F`} hint={`${paidSum._count} paiement(s)`} className="col-span-2 md:col-span-1" />
      </div>

      <Panel title="Inscriptions par jour (14 jours)">
        <div className="flex h-44 items-end gap-1 sm:h-52 sm:gap-2" role="img" aria-label="Histogramme des inscriptions par jour">
          {days.map((d, i) => (
            <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[11px] font-extrabold sm:text-xs">{d.n || ""}</span>
              <div className="w-full rounded-t-md border-2 border-ink bg-kraken sm:rounded-t-lg sm:border-[3px]" style={{ height: `${Math.max(4, (d.n / max) * 100)}%` }} />
              <span className="relative h-3.5 w-full">
                <span className={`absolute left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap text-steel ${i % 2 ? "max-sm:hidden" : ""}`}>{d.label}</span>
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Par statut">
          <ul className="flex flex-col gap-2">
            {Object.keys(STATUS_LABELS).map((s) => (
              <li key={s} className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-sm font-bold">
                <span>{STATUS_LABELS[s]}</span>
                <span className="font-extrabold">{count(s)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Par pays">
          <ul className="flex flex-col gap-2">
            {byCountry.map((c) => (
              <li key={c.country} className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-sm font-bold">
                <span>{countryName(c.country)}</span>
                <span className="font-extrabold">{c._count}</span>
              </li>
            ))}
            {byCountry.length === 0 && <li className="text-sm text-steel">Aucune inscription.</li>}
          </ul>
        </Panel>
        <Panel title="Par niveau">
          <ul className="flex flex-col gap-2">
            {LEVELS.map((l) => (
              <li key={l.value} className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-sm font-bold">
                <span>{l.label}</span>
                <span className="font-extrabold">{byLevel.find((b) => b.level === l.value)?._count ?? 0}</span>
              </li>
            ))}
          </ul>
          {emailsFailed > 0 && <p className="rounded-xl bg-[#FFE9E9] p-3 text-sm font-bold">{emailsFailed} e-mail(s) en échec sur 14 jours.</p>}
        </Panel>
      </div>
    </div>
  );
}

export default function AdminHome() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}>
      <Dashboard />
    </Suspense>
  );
}
