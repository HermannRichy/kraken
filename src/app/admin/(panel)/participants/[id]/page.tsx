import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { NoteForm, ParticipantActions } from "@/components/admin/participant-actions";
import { fmtDate, Panel, StatusBadge } from "@/components/admin/ui";
import { countryName } from "@/config/countries";
import { NETWORKS } from "@/config/payment";
import { LEVELS } from "@/lib/validation";
import { db } from "@/lib/server/db";
import { can, requireStaff } from "@/lib/server/session";
import type { Role } from "@/lib/permissions";

const CONSENTS: Record<string, string> = { rules: "Règles et fair-play", terms: "Conditions de participation", data: "Traitement des données", public_name: "Nom public au classement" };

async function Detail({ params }: { params: PageProps<"/admin/participants/[id]">["params"] }) {
  const { role } = await requireStaff({ participant: ["read"] });
  const { id } = await params;
  const p = await db.participant.findUnique({
    where: { id },
    include: {
      user: { select: { emailVerified: true, createdAt: true } },
      consents: { orderBy: { acceptedAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
      emailLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
    },
  });
  if (!p) notFound();
  const logs = await db.auditLog.findMany({ where: { targetType: "participant", targetId: p.id }, orderBy: { createdAt: "desc" }, take: 30, include: { actor: { select: { name: true } } } });
  const r = role as Role;
  const perms = {
    resend: can(r, { participant: ["resend"] }),
    note: can(r, { participant: ["note"] }),
    disqualify: can(r, { participant: ["disqualify"] }),
    update: can(r, { participant: ["update"] }),
    keys: can(r, { keys: ["revoke"] }),
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/participants" className="self-start text-sm font-extrabold underline">
        ← Participants
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">{p.fullName}</h1>
        <StatusBadge status={p.status} />
      </div>

      <Panel title="Actions">
        <ParticipantActions participantId={p.id} emailVerified={p.user.emailVerified} status={p.status} perms={perms} />
        {p.disqualifiedReason && <p className="text-sm font-bold">Motif de disqualification : {p.disqualifiedReason}</p>}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Informations">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {[
              ["E-mail", `${p.email}${p.user.emailVerified ? " ✓" : " (non confirmé)"}`],
              ["Téléphone", p.phone],
              ["GitHub", `@${p.githubLogin}${p.githubId ? ` (#${p.githubId})` : ""}`],
              ["Lieu", `${p.city}, ${countryName(p.country)}`],
              ["Niveau", LEVELS.find((l) => l.value === p.level)?.label ?? p.level],
              ["Langage", p.language ?? "-"],
              ["Source", p.referral ?? "-"],
              ["Inscrit le", fmtDate(p.createdAt)],
              ["Payé le", p.registeredAt ? fmtDate(p.registeredAt) : "-"],
              ["Clés émises", p.keysIssuedAt ? fmtDate(p.keysIssuedAt) : "-"],
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-bold text-steel">{k}</dt>
                <dd className="font-extrabold break-all">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Consentements">
          <ul className="flex flex-col gap-2 text-sm">
            {p.consents.map((c) => (
              <li key={c.id} className="flex justify-between gap-3">
                <span className="font-bold">{CONSENTS[c.kind]}</span>
                <span className="text-steel">
                  v{c.version} · {fmtDate(c.acceptedAt)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Paiements">
          {p.payments.length === 0 ? (
            <p className="text-sm text-steel">Aucun paiement.</p>
          ) : (
            <ul className="flex flex-col gap-3 text-sm">
              {p.payments.map((pay) => (
                <li key={pay.id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-paper p-3">
                  <span className="font-extrabold">
                    {pay.amount.toLocaleString("fr-FR")} F · {NETWORKS.find((n) => n.slug === pay.network)?.label ?? pay.network}
                  </span>
                  <span className="font-bold">{pay.status}</span>
                  <span className="w-full text-xs text-steel">
                    {fmtDate(pay.createdAt)} · réf. {pay.providerRef ?? "-"}
                    {pay.failureReason ? ` · ${pay.failureReason}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="E-mails envoyés">
          <ul className="flex flex-col gap-2 text-sm">
            {p.emailLogs.map((e) => (
              <li key={e.id} className="flex justify-between gap-3">
                <span className="font-bold">{e.type}</span>
                <span className={e.status === "failed" ? "font-bold text-[#C62828]" : "text-steel"}>
                  {e.status} · {fmtDate(e.createdAt)}
                </span>
              </li>
            ))}
            {p.emailLogs.length === 0 && <li className="text-steel">Aucun e-mail.</li>}
          </ul>
        </Panel>

        <Panel title="Notes internes">
          {perms.note && <NoteForm participantId={p.id} />}
          <ul className="flex flex-col gap-3">
            {p.notes.map((n) => (
              <li key={n.id} className="rounded-xl border-2 border-ink p-3 text-sm">
                <p className="font-semibold whitespace-pre-line">{n.body}</p>
                <p className="mt-1 text-xs text-steel">
                  {n.author.name} · {fmtDate(n.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Historique (audit)">
          <ul className="flex flex-col gap-2 text-sm">
            {logs.map((l) => (
              <li key={l.id} className="flex justify-between gap-3">
                <span className="font-bold">{l.action}</span>
                <span className="text-steel">
                  {l.actor?.name ?? "système"} · {fmtDate(l.createdAt)}
                </span>
              </li>
            ))}
            {logs.length === 0 && <li className="text-steel">Aucune action sensible.</li>}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

export default function ParticipantPage(props: PageProps<"/admin/participants/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}>
      <Detail params={props.params} />
    </Suspense>
  );
}
