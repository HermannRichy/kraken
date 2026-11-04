import { Suspense } from "react";
import Link from "next/link";

import { EvaluationForm } from "@/components/admin/evaluation-form";
import { PageHeader, Panel, fmtDate } from "@/components/dashboard/ui";
import { db } from "@/lib/server/db";
import { requireStaff } from "@/lib/server/session";

async function Submissions() {
  const { session, role } = await requireStaff({ submission: ["read"] });
  const submissions = await db.submission.findMany({ include: { participant: { select: { fullName: true, email: true, githubLogin: true } }, form: { select: { title: true } }, evaluations: { select: { reviewerId: true, score: true, feedback: true } }, attachments: { select: { id: true, fileName: true } } }, orderBy: { submittedAt: "desc" } });
  return <div className="flex flex-col gap-6"><PageHeader title="Soumissions" description="Les livraisons sont visibles par l'organisation et le jury. Les coordonnées de paiement restent exclues." />
    <div className="grid gap-5">{submissions.map((submission) => { const mine = submission.evaluations.find((item) => item.reviewerId === session.user.id); return <Panel key={submission.id} title={`${submission.participant.fullName} · ${submission.form.title}`} action={<span className="rounded-full border-2 border-ink px-2.5 py-1 text-xs font-extrabold">{submission.status}</span>}><div className="grid gap-4 lg:grid-cols-2"><div className="text-sm font-semibold text-steel"><p>{submission.participant.email} · @{submission.participant.githubLogin}</p><p className="mt-1">Envoyée : {submission.submittedAt ? fmtDate(submission.submittedAt) : "Brouillon"}</p><dl className="mt-4 grid gap-2">{Object.entries(submission.answers as Record<string, unknown>).map(([key, value]) => <div key={key}><dt className="text-xs font-extrabold text-ink">Champ {key}</dt><dd className="break-words">{String(value)}</dd></div>)}</dl>{submission.attachments.length > 0 && <ul className="mt-4 flex flex-wrap gap-2">{submission.attachments.map((file) => <li key={file.id}><Link className="rounded-lg border-2 border-ink px-2 py-1 text-xs font-extrabold" href={`/api/submissions/${submission.id}/attachments/${file.id}`}>{file.fileName}</Link></li>)}</ul>}</div><EvaluationForm submissionId={submission.id} initialScore={mine?.score ?? null} initialFeedback={mine?.feedback ?? null} editable={role === "jury" || role === "admin"} /></div></Panel>; })}{!submissions.length && <Panel><p className="text-sm font-semibold text-steel">Aucune livraison reçue pour le moment.</p></Panel>}</div>
  </div>;
}
export default function SubmissionsPage() { return <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}><Submissions /></Suspense>; }
