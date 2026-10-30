import Link from "next/link";
import { Suspense } from "react";

import { fmtDate, Panel, StatusBadge, STATUS_LABELS } from "@/components/admin/ui";
import { countryName } from "@/config/countries";
import type { Prisma } from "@/generated/prisma/client";
import { LEVELS } from "@/lib/validation";
import { db } from "@/lib/server/db";
import { can, requireStaff } from "@/lib/server/session";
import type { Role } from "@/lib/permissions";

const PAGE_SIZE = 25;

async function List({ searchParams }: { searchParams: PageProps<"/admin/participants">["searchParams"] }) {
  const { role } = await requireStaff({ participant: ["read"] });
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const status = typeof sp.statut === "string" && sp.statut in STATUS_LABELS ? sp.statut : "";
  const level = typeof sp.niveau === "string" && LEVELS.some((l) => l.value === sp.niveau) ? sp.niveau : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ParticipantWhereInput = {
    ...(status ? { status: status as Prisma.ParticipantWhereInput["status"] } : {}),
    ...(level ? { level: level as Prisma.ParticipantWhereInput["level"] } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { githubLogin: { contains: q.toLowerCase() } },
            { phone: { contains: q.replace(/\s/g, "") } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    db.participant.count({ where }),
    db.participant.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (status) u.set("statut", status);
    if (level) u.set("niveau", level);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">Participants</h1>
        {can(role as Role, { participant: ["export"] }) && (
          <a href={`/admin/participants/export${qs(1)}`} className="inline-flex min-h-11 items-center rounded-[14px] border-[3px] border-ink bg-white px-4 text-sm font-extrabold shadow-[3px_3px_0_#000]">
            Exporter en CSV
          </a>
        )}
      </div>

      <form className="flex flex-wrap gap-3" role="search">
        <input
          name="q"
          defaultValue={q}
          placeholder="Nom, e-mail, GitHub, téléphone…"
          aria-label="Rechercher"
          className="min-h-12 min-w-[220px] flex-1 rounded-[14px] border-[3px] border-ink bg-white px-4 font-semibold outline-none focus:shadow-[3px_3px_0_#0047FF]"
        />
        <select name="statut" defaultValue={status} aria-label="Statut" className="min-h-12 rounded-[14px] border-[3px] border-ink bg-white px-3 font-bold">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="niveau" defaultValue={level} aria-label="Niveau" className="min-h-12 rounded-[14px] border-[3px] border-ink bg-white px-3 font-bold">
          <option value="">Tous les niveaux</option>
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <button className="min-h-12 rounded-[14px] border-[3px] border-ink bg-ink px-5 font-extrabold text-white shadow-[3px_3px_0_#0047FF]">Filtrer</button>
      </form>

      <Panel>
        <p className="text-sm font-bold text-steel">{total} participant(s)</p>
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b-[3px] border-ink text-xs tracking-[0.06em] uppercase">
                <th className="px-2 py-3">Nom</th>
                <th className="px-2 py-3">GitHub</th>
                <th className="px-2 py-3">Pays</th>
                <th className="px-2 py-3">Niveau</th>
                <th className="px-2 py-3">Statut</th>
                <th className="px-2 py-3">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-mist hover:bg-paper">
                  <td className="px-2 py-3">
                    <Link href={`/admin/participants/${p.id}`} className="font-extrabold underline-offset-2 hover:underline">
                      {p.fullName}
                    </Link>
                    <div className="text-xs text-steel">{p.email}</div>
                  </td>
                  <td className="px-2 py-3 font-mono text-xs">@{p.githubLogin}</td>
                  <td className="px-2 py-3">{countryName(p.country)}</td>
                  <td className="px-2 py-3">{LEVELS.find((l) => l.value === p.level)?.label}</td>
                  <td className="px-2 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center font-bold text-steel">
                    Aucun participant ne correspond.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
            {page > 1 ? (
              <Link href={`/admin/participants${qs(page - 1)}`} className="font-extrabold underline">
                ← Précédent
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm font-bold">
              Page {page} / {pages}
            </span>
            {page < pages ? (
              <Link href={`/admin/participants${qs(page + 1)}`} className="font-extrabold underline">
                Suivant →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </Panel>
    </div>
  );
}

export default function ParticipantsPage(props: PageProps<"/admin/participants">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}>
      <List searchParams={props.searchParams} />
    </Suspense>
  );
}
