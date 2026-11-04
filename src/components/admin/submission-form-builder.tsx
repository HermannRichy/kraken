"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createSubmissionFormAction } from "@/app/admin/actions";

type FieldType = "short_text" | "long_text" | "url" | "select" | "checkbox" | "file";
type Field = { label: string; help: string; type: FieldType; required: boolean; options: string; accept: string; maxFiles: number };
const TYPES: { value: FieldType; label: string }[] = [
  { value: "short_text", label: "Texte court" }, { value: "long_text", label: "Texte long" }, { value: "url", label: "Lien / URL" }, { value: "select", label: "Liste de choix" }, { value: "checkbox", label: "Case à cocher" }, { value: "file", label: "Fichier" },
];
const empty = (): Field => ({ label: "", help: "", type: "short_text", required: false, options: "", accept: "", maxFiles: 1 });

export function SubmissionFormBuilder() {
  const [fields, setFields] = useState<Field[]>([empty()]);
  const [pending, start] = useTransition();
  const update = (index: number, change: Partial<Field>) => setFields((all) => all.map((field, i) => i === index ? { ...field, ...change } : field));
  return <form onSubmit={(event) => {
    event.preventDefault(); const fd = new FormData(event.currentTarget);
    start(async () => {
      const res = await createSubmissionFormAction({ title: fd.get("title"), description: fd.get("description") || undefined, opensAt: fd.get("opensAt") || undefined, closesAt: fd.get("closesAt") || undefined, fields: fields.map(({ options, ...field }) => ({ ...field, options: options.split("\n").map((v) => v.trim()).filter(Boolean) })) });
      if (res.ok) { toast.success(res.message); event.currentTarget.reset(); setFields([empty()]); } else toast.error(res.error);
    });
  }} className="flex flex-col gap-5">
    <div className="grid gap-4 md:grid-cols-2"><label className="flex flex-col gap-1.5 font-bold">Titre<input name="title" required maxLength={140} className="min-h-11 rounded-xl border-[3px] border-ink bg-white px-3" placeholder="Livraison finale" /></label><label className="flex flex-col gap-1.5 font-bold">Ouverture<input name="opensAt" type="datetime-local" className="min-h-11 rounded-xl border-[3px] border-ink bg-white px-3" /></label><label className="flex flex-col gap-1.5 font-bold md:col-span-2">Consignes<textarea name="description" rows={3} maxLength={2000} className="rounded-xl border-[3px] border-ink bg-white p-3" /></label><label className="flex flex-col gap-1.5 font-bold">Fermeture<input name="closesAt" type="datetime-local" className="min-h-11 rounded-xl border-[3px] border-ink bg-white px-3" /></label></div>
    <div className="flex flex-col gap-4">{fields.map((field, index) => <fieldset key={index} className="grid gap-3 rounded-2xl border-[3px] border-ink bg-paper p-4 md:grid-cols-2"><legend className="px-1 font-extrabold">Champ {index + 1}</legend><label className="flex flex-col gap-1 font-bold">Libellé<input value={field.label} onChange={(e) => update(index, { label: e.target.value })} required className="min-h-10 rounded-xl border-2 border-ink bg-white px-3" /></label><label className="flex flex-col gap-1 font-bold">Type<select value={field.type} onChange={(e) => update(index, { type: e.target.value as FieldType })} className="min-h-10 rounded-xl border-2 border-ink bg-white px-3">{TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label><label className="flex flex-col gap-1 font-bold md:col-span-2">Aide (facultatif)<input value={field.help} onChange={(e) => update(index, { help: e.target.value })} className="min-h-10 rounded-xl border-2 border-ink bg-white px-3" /></label>{field.type === "select" && <label className="flex flex-col gap-1 font-bold md:col-span-2">Choix — un par ligne<textarea value={field.options} onChange={(e) => update(index, { options: e.target.value })} required rows={3} className="rounded-xl border-2 border-ink bg-white p-3" /></label>}{field.type === "file" && <><label className="flex flex-col gap-1 font-bold">Types acceptés<input value={field.accept} onChange={(e) => update(index, { accept: e.target.value })} placeholder=".pdf,.zip" className="min-h-10 rounded-xl border-2 border-ink bg-white px-3" /></label><label className="flex flex-col gap-1 font-bold">Fichiers maximum<input type="number" min="1" max="5" value={field.maxFiles} onChange={(e) => update(index, { maxFiles: Number(e.target.value) })} className="min-h-10 rounded-xl border-2 border-ink bg-white px-3" /></label></>}<label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={field.required} onChange={(e) => update(index, { required: e.target.checked })} /> Obligatoire</label>{fields.length > 1 && <button type="button" onClick={() => setFields((all) => all.filter((_, i) => i !== index))} className="justify-self-start text-sm font-extrabold underline">Retirer</button>}</fieldset>)}</div>
    <div className="flex flex-wrap gap-3"><button type="button" onClick={() => setFields((all) => [...all, empty()])} className="min-h-11 rounded-xl border-[3px] border-ink bg-white px-4 font-extrabold">Ajouter un champ</button><button disabled={pending} className="min-h-11 rounded-xl border-[3px] border-ink bg-kraken px-5 font-extrabold text-white shadow-[4px_4px_0_#000] disabled:opacity-60">{pending ? "Création…" : "Créer le brouillon"}</button></div>
  </form>;
}
