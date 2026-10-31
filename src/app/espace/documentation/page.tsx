import { ArrowRight, BookOpen, CalendarDays, CircleHelp, FileText, Scale, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Documentation" };

const RESOURCES = [
  { href: "/documentation", label: "Dossier du participant", hint: "Cahier des charges, contrats OpenAPI, image Docker KrakenPay. Disponible le 10 novembre.", icon: BookOpen, featured: true },
  { href: "/regles", label: "Règles et fair-play", hint: "Ce qui est autorisé, ce qui ne l'est pas.", icon: Scale },
  { href: "/le-defi", label: "Le défi", hint: "Le sujet, les attendus et les critères.", icon: FileText },
  { href: "/calendrier", label: "Calendrier", hint: "Ouverture, livraison, résultats.", icon: CalendarDays },
  { href: "/prix", label: "Prix", hint: "Ce qui attend les meilleurs.", icon: Trophy },
  { href: "/faq", label: "FAQ", hint: "Les réponses aux questions fréquentes.", icon: CircleHelp },
];

export default function DocsPage() {
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
    </div>
  );
}
