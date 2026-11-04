import type { Metadata } from "next";

import { PageMotion } from "@/components/motion/page-motion";
import { LegalTabs, type LegalSection } from "@/components/features/legal-tabs";
import { Burst } from "@/components/ui/doodles";
import { Chip, Container, Highlight } from "@/components/ui/primitives";
import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Mentions et conditions",
  description: "Conditions de participation, données personnelles et mentions légales.",
  path: "/mentions",
});

const SECTIONS: LegalSection[] = [
  {
    label: "Conditions de participation",
    blocks: [
      { h: "Inscription", p: "Une inscription = une personne = un dépôt GitHub. Un seul compte par e-mail, par identifiant GitHub et par téléphone ; un doublon est refusé." },
      { h: "Frais", p: "2 000 FCFA, payés par Mobile Money uniquement. Un reçu est envoyé par e-mail après confirmation du paiement." },
      { h: "Places et liste d'attente", p: "100 participants au maximum. Au-delà, liste d'attente avec notification automatique si une place se libère." },
      { h: "Désistement et remboursement", p: "Remboursement possible jusqu'à 7 jours après l'inscription. Ensuite, non remboursable, sauf annulation du défi." },
      { h: "Annulation du défi", p: "Si moins de 10 personnes sont inscrites à la clôture, le défi est annulé et tous les frais sont remboursés automatiquement." },
      { h: "Fair-play", p: "Tout manquement aux règles de fair-play publiées entraîne la disqualification du podium, et du défi s'il est volontaire." },
    ],
  },
  {
    label: "Données personnelles",
    blocks: [
      { h: "Ce que nous collectons", p: "Uniquement les données du formulaire d'inscription. Aucune donnée de carte n'est stockée : seul le prestataire de paiement les voit." },
      { h: "Consentements", p: "Chaque consentement est enregistré avec sa date et la version du texte accepté : règles, conditions, traitement des données, nom public dans le classement." },
      { h: "Conservation", p: "Les demandes de contact sont conservées au maximum 24 mois. Les données d'inscription et de paiement sont conservées pendant la durée nécessaire à l'organisation du défi, puis selon les obligations légales applicables. Les certificats restent vérifiables." },
      { h: "Vos droits", p: "Vous pouvez demander l'accès, la rectification ou la suppression de vos données, sous réserve des données que la loi impose de conserver, notamment les reçus. Contact : kraken@hustlerlabs.tech." },
      { h: "Cadre légal", p: "Loi béninoise sur la protection des données personnelles et, pour les participants européens, le RGPD." },
    ],
  },
  {
    label: "Mentions légales",
    blocks: [
      { h: "Éditeur", p: "HustlerLabs — studio de développement logiciel, établissement individuel exploité par Igor Adande. Siège : Zounga, Godomey, Abomey-Calavi, Bénin. RCCM : RB/ABC/25 A 134256 (Tribunal de commerce de Cotonou, 19/12/2025). IFU : 0202290294802." },
      { h: "Responsable de la publication", p: "Igor Adande." },
      { h: "Hébergement", p: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis." },
      { h: "Propriété intellectuelle", p: "La marque Kraken, son logo et ses éléments graphiques appartiennent à HustlerLabs." },
    ],
  },
];

export default function MentionsPage() {
  return (
    <PageMotion>
      <section className="border-b-[3px] border-ink bg-paper">
        <Container className="flex flex-col gap-6 pt-14 pb-14 lg:pt-20 lg:pb-[72px]">
          <Chip doodle="squiggle">Mentions et conditions</Chip>
          <h1 className="max-w-[900px] text-[2.3rem] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[72px] lg:leading-none">
            <span data-split>Les règles du jeu, </span>
            <Highlight doodle={<Burst flip size={40} className="-top-8 -right-11" />}>noir sur blanc.</Highlight>
          </h1>
          <p data-reveal className="text-[15px] font-bold text-steel">
            Version 1.0 · mise à jour le 2 novembre 2026
          </p>
        </Container>
      </section>
      <section className="border-b-[3px] border-ink">
        <Container className="pt-[72px] pb-20 lg:pb-24">
          <LegalTabs sections={SECTIONS} />
        </Container>
      </section>
    </PageMotion>
  );
}
