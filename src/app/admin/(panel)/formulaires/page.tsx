import { Suspense } from "react";

import { SubmissionFormBuilder } from "@/components/admin/submission-form-builder";
import { FormStatus } from "@/components/admin/resource-status";
import { PageHeader, Panel, fmtDate } from "@/components/dashboard/ui";
import { db } from "@/lib/server/db";
import { requireStaff } from "@/lib/server/session";

async function Forms() {
  await requireStaff({ submissionForm: ["read"] });
  const forms = await db.submissionForm.findMany({ include: { _count: { select: { fields: true, submissions: true } } }, orderBy: { createdAt: "desc" } });
  return <div className="flex flex-col gap-6"><PageHeader title="Formulaires de livraison" description="Composez les informations et fichiers demandés aux participants. Chaque formulaire débute en brouillon." />
    <Panel title="Nouveau formulaire"><SubmissionFormBuilder /></Panel>
    <Panel title={`Formulaires · ${forms.length}`}><ul className="flex flex-col divide-y divide-mist">{forms.map((form) => <li key={form.id} className="flex flex-wrap justify-between gap-3 py-4"><div><p className="font-extrabold">{form.title}</p><p className="text-sm font-semibold text-steel">{form._count.fields} champ(s) · {form._count.submissions} livraison(s) · {form.status}</p>{form.closesAt && <p className="mt-1 text-xs font-bold text-steel">Ferme le {fmtDate(form.closesAt)}</p>}</div><div className="flex items-center gap-3"><span className="rounded-full border-2 border-ink px-3 py-1 text-xs font-extrabold">{form.status}</span><FormStatus id={form.id} status={form.status} /></div></li>)}{!forms.length && <li className="py-3 text-sm font-semibold text-steel">Créez le premier formulaire de livraison.</li>}</ul></Panel>
  </div>;
}
export default function SubmissionFormsPage() { return <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}><Forms /></Suspense>; }
