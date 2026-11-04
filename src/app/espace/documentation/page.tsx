import { ArrowRight, BookOpen, CalendarDays, CircleHelp, FileText, Scale, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/ui";
import { db } from "@/lib/server/db";
import { requireParticipant } from "@/lib/server/session";

export const metadata: Metadata = { title: "Documentation" };

const RESOURCES = [
  { href: "/documentation", label: "Dossier du participant", hint: "Cahier des charges, contrats OpenAPI, image Docker KrakenPay. Disponible le 10 novembre.", icon: BookOpen, featured: true },
  { href: "/regles", label: "Règles et fair-play", hint: "Ce qui est autorisé, ce qui ne l'est pas.", icon: Scale },
  { href: "/le-defi", label: "Le défi", hint: "Le sujet, les attendus et les critères.", icon: FileText },
  { href: "/calendrier", label: "Calendrier", hint: "Ouverture, livraison, résultats.", icon: CalendarDays },
  { href: "/prix", label: "Prix", hint: "Ce qui attend les meilleurs.", icon: Trophy },
  { href: "/faq", label: "FAQ", hint: "Les réponses aux questions fréquentes.", icon: CircleHelp },
];

export default async function DocsPage() {
  await requireParticipant();
  const now = new Date();
  const privateResources = await db.resource.findMany({ where: { audience: "participant", status: "published", OR: [{ availableAt: null }, { availableAt: { lte: now } }] }, orderBy: { publishedAt: "desc" } });
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader title="Documentation" description="Tout ce qu'il faut lire avant d'écrire la première ligne." />
      <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {RESOURCES.map(({ href, label, hint, icon: Icon, featured }) => (
          <li key={href} className={featured ? "md:col-span-2 2xl:col-span-3" : undefined}>
            <Link
              href={href}
              className={`group flex h-full items-start gap-4 rounded-[22px] border-[3px] border-ink p-5 transition-transform hover:-translate-y-0.5 ${featured ? "bg-ink text-white shadow-[6px_6px_0_#0047FF]" : "bg-white shadow-[5px_5px_0_#000]"}`}
            >
              <span className={`flex size-12 flex-none items-center justify-center rounded-[14px] border-[3px] ${featured ? "border-white bg-kraken" : "border-ink bg-paper"}`}>
                <Icon size={22} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-extrabold">{label}</span>
                <span className={`block text-[14px] font-semibold ${featured ? "text-mist" : "text-steel"}`}>{hint}</span>
              </span>
              <ArrowRight size={20} strokeWidth={2.75} aria-hidden="true" className="mt-1 flex-none transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
      {privateResources.length > 0 && <section className="flex flex-col gap-3"><h2 className="text-xl font-extrabold">Ressources de l'organisation</h2><ul className="grid gap-3 md:grid-cols-2">{privateResources.map((resource) => <li key={resource.id} className="rounded-[18px] border-[3px] border-ink bg-white p-4 shadow-[4px_4px_0_#000]"><p className="font-extrabold">{resource.title}</p>{resource.description && <p className="mt-1 text-sm font-semibold text-steel">{resource.description}</p>}{resource.kind === "file" ? <a href={`/api/ressources/${resource.id}`} className="mt-3 inline-flex rounded-lg border-2 border-ink bg-paper px-3 py-2 text-sm font-extrabold">Télécharger {resource.fileName}</a> : <a href={resource.url ?? "#"} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg border-2 border-ink bg-paper px-3 py-2 text-sm font-extrabold">Ouvrir la ressource</a>}</li>)}</ul></section>}
    </div>
  );
}
