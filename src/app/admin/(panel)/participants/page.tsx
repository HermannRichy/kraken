import Link from "next/link";
import { Suspense } from "react";

import { fmtDate, PageHeader, Panel, StatusBadge, STATUS_LABELS } from "@/components/dashboard/ui";
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
      <PageHeader
        title="Participants"
        description={`${total} résultat${total > 1 ? "s" : ""}${q || status || level ? " (filtré)" : ""}`}
        actions={
          can(role as Role, { participant: ["export"] }) && (
            <a href={`/admin/participants/export${qs(1)}`} className="inline-flex min-h-11 items-center rounded-[14px] border-[3px] border-ink bg-white px-4 text-sm font-extrabold shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5">
              Exporter en CSV
            </a>
          )
        }
      />

      <form className="grid grid-cols-2 gap-3 lg:flex lg:flex-wrap" role="search">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Nom, e-mail, GitHub, téléphone…"
          aria-label="Rechercher"
          className="col-span-2 min-h-12 min-w-0 rounded-[14px] border-[3px] border-ink bg-white px-4 text-base font-semibold outline-none focus:shadow-[3px_3px_0_#0047FF] lg:min-w-[240px] lg:flex-1"
        />
        <select name="statut" defaultValue={status} aria-label="Statut" className="min-h-12 w-full min-w-0 rounded-[14px] border-[3px] border-ink bg-white px-3 text-base font-bold lg:w-auto">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="niveau" defaultValue={level} aria-label="Niveau" className="min-h-12 w-full min-w-0 rounded-[14px] border-[3px] border-ink bg-white px-3 text-base font-bold lg:w-auto">
          <option value="">Tous les niveaux</option>
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <button className="col-span-2 min-h-12 rounded-[14px] border-[3px] border-ink bg-ink px-5 font-extrabold text-white shadow-[3px_3px_0_#0047FF] lg:col-span-1">Filtrer</button>
      </form>

      {/* Cartes (mobile, tablette et écrans moyens) */}
      <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
        {rows.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/participants/${p.id}`} className="flex h-full flex-col gap-3 rounded-[20px] border-[3px] border-ink bg-white p-4 shadow-[4px_4px_0_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[17px] font-extrabold">{p.fullName}</div>
                  <div className="truncate text-sm font-semibold text-steel">{p.email}</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-bold text-steel">
                <span className="font-mono text-ink">@{p.githubLogin}</span>
                <span>{countryName(p.country)}</span>
                <span>{LEVELS.find((l) => l.value === p.level)?.label}</span>
                <span>{fmtDate(p.createdAt)}</span>
              </div>
            </Link>
          </li>
        ))}
        {rows.length === 0 && <li className="rounded-[20px] border-[3px] border-dashed border-ink bg-white p-8 text-center font-bold text-steel md:col-span-2">Aucun participant ne correspond.</li>}
      </ul>

      <Panel className={pages > 1 ? "" : "max-xl:hidden"}>
        <div className="-mx-2 overflow-x-auto max-xl:hidden">
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
          <nav className="flex items-center justify-between gap-3 xl:border-t-[3px] xl:border-ink xl:pt-4" aria-label="Pagination">
            {page > 1 ? (
              <Link href={`/admin/participants${qs(page - 1)}`} className="inline-flex min-h-11 items-center rounded-[12px] border-[3px] border-ink bg-white px-3 text-sm font-extrabold">
                ← Précédent
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm font-bold">
              Page {page} / {pages}
            </span>
            {page < pages ? (
              <Link href={`/admin/participants${qs(page + 1)}`} className="inline-flex min-h-11 items-center rounded-[12px] border-[3px] border-ink bg-white px-3 text-sm font-extrabold">
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
