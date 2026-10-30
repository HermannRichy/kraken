import { Suspense } from "react";

import { Panel, Stat, STATUS_LABELS } from "@/components/admin/ui";
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
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">Tableau de bord</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Inscriptions" value={total} />
        <Stat label="Inscrits payés" value={count("registered")} tone="blue" />
        <Stat label="Places restantes" value={Math.max(0, cap - taken)} tone="black" hint={`sur ${cap}`} />
        <Stat label="E-mails non confirmés" value={count("pre_registered")} />
        <Stat label="Encaissé" value={`${(paidSum._sum.amount ?? 0).toLocaleString("fr-FR")} F`} hint={`${paidSum._count} paiement(s)`} />
      </div>

      <Panel title="Inscriptions par jour (14 jours)">
        <div className="flex h-48 items-end gap-1.5 sm:gap-2" role="img" aria-label="Histogramme des inscriptions par jour">
          {days.map((d) => (
            <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-xs font-extrabold">{d.n || ""}</span>
              <div className="w-full rounded-t-lg border-[3px] border-ink bg-kraken" style={{ height: `${Math.max(4, (d.n / max) * 100)}%` }} />
              <span className="text-[10px] font-bold text-steel">{d.label}</span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Par statut">
          <ul className="flex flex-col gap-2">
            {Object.keys(STATUS_LABELS).map((s) => (
              <li key={s} className="flex justify-between gap-3 text-sm font-bold">
                <span>{STATUS_LABELS[s]}</span>
                <span className="font-extrabold">{count(s)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Par pays">
          <ul className="flex flex-col gap-2">
            {byCountry.map((c) => (
              <li key={c.country} className="flex justify-between gap-3 text-sm font-bold">
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
              <li key={l.value} className="flex justify-between gap-3 text-sm font-bold">
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
