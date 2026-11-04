import { Suspense } from "react";

import { createResourceAction } from "@/app/admin/actions";
import { ResourceStatus } from "@/components/admin/resource-status";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { db } from "@/lib/server/db";
import { requireStaff } from "@/lib/server/session";

async function Resources() {
  await requireStaff({ resource: ["read"] });
  const resources = await db.resource.findMany({ orderBy: { createdAt: "desc" } });
  return <div className="flex flex-col gap-6"><PageHeader title="Ressources" description="Documents, liens et références Docker distribués de façon contrôlée." />
    <Panel title="Ajouter une ressource"><form action={async (formData) => { "use server"; await createResourceAction(formData); }} className="grid gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1.5 font-bold">Titre<input name="title" required maxLength={140} className="min-h-11 rounded-xl border-[3px] border-ink bg-white px-3" /></label>
      <label className="flex flex-col gap-1.5 font-bold">Type<select name="kind" defaultValue="file" className="min-h-11 rounded-xl border-[3px] border-ink bg-white px-3"><option value="file">Fichier privé</option><option value="link">Lien externe</option><option value="docker_image">Image Docker / registre</option></select></label>
      <label className="flex flex-col gap-1.5 font-bold">Public<select name="audience" defaultValue="participant" className="min-h-11 rounded-xl border-[3px] border-ink bg-white px-3"><option value="participant">Participants connectés</option><option value="public">Public</option></select></label>
      <label className="flex flex-col gap-1.5 font-bold">Ouverture (facultatif)<input name="availableAt" type="datetime-local" className="min-h-11 rounded-xl border-[3px] border-ink bg-white px-3" /></label>
      <label className="flex flex-col gap-1.5 font-bold md:col-span-2">Description<textarea name="description" maxLength={2000} rows={3} className="rounded-xl border-[3px] border-ink bg-white p-3" /></label>
      <label className="flex flex-col gap-1.5 font-bold md:col-span-2">Fichier (maximum 4 Mo)<input name="file" type="file" className="rounded-xl border-[3px] border-ink bg-white p-3" /></label>
      <label className="flex flex-col gap-1.5 font-bold md:col-span-2">Lien ou référence Docker<input name="url" type="text" placeholder="https://… ou ghcr.io/organisation/image@sha256:…" className="min-h-11 rounded-xl border-[3px] border-ink bg-white px-3" /></label>
      <button className="min-h-12 rounded-xl border-[3px] border-ink bg-kraken px-5 font-extrabold text-white shadow-[4px_4px_0_#000] md:justify-self-start">Créer le brouillon</button>
    </form></Panel>
    <Panel title={`Catalogue · ${resources.length}`}><ul className="flex flex-col divide-y divide-mist">{resources.map((r) => <li key={r.id} className="flex flex-wrap justify-between gap-3 py-3"><div><p className="font-extrabold">{r.title}</p><p className="text-sm font-semibold text-steel">{r.kind} · {r.audience} · {r.status}</p></div><div className="flex items-center gap-3"><span className="text-sm font-bold">{r.fileName ?? r.url ?? "—"}</span><ResourceStatus id={r.id} status={r.status} /></div></li>)}{!resources.length && <li className="py-3 text-sm font-semibold text-steel">Aucune ressource pour le moment.</li>}</ul></Panel>
  </div>;
}

export default function ResourcesPage() { return <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-white" />}><Resources /></Suspense>; }
