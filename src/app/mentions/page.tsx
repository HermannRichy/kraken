import type { Metadata } from "next";

import { LegalTabs, type LegalSection } from "@/components/features/legal-tabs";
import { Burst } from "@/components/ui/doodles";
import { Chip, Container, Highlight } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Mentions et conditions",
  description: "Conditions de participation, données personnelles et mentions légales.",
};

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
      { h: "Conservation", p: "Durée de conservation : [À FIXER]. Les certificats restent vérifiables." },
      { h: "Vos droits", p: "Suppression ou anonymisation sur demande, sauf ce que la loi impose de garder, comme les reçus. Contact : [contact@domaine]." },
      { h: "Cadre légal", p: "Loi béninoise sur la protection des données personnelles et, pour les participants européens, le RGPD." },
    ],
  },
  {
    label: "Mentions légales",
    blocks: [
      { h: "Éditeur", p: "HustlerLabs · [forme juridique, adresse, immatriculation]." },
      { h: "Responsable de la publication", p: "[Nom du responsable]." },
      { h: "Hébergement", p: "Hébergé par HustlerLabs · [hébergeur, adresse]." },
      { h: "Propriété intellectuelle", p: "La marque Kraken, son logo et ses éléments graphiques appartiennent à HustlerLabs." },
    ],
  },
];

export default function MentionsPage() {
  return (
    <>
      <section className="border-b-[3px] border-ink bg-paper">
        <Container className="flex flex-col gap-6 pt-14 pb-14 lg:pt-20 lg:pb-[72px]">
          <Chip doodle="squiggle">Mentions et conditions</Chip>
          <h1 className="max-w-[900px] text-[2.3rem] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[72px] lg:leading-none">
            <span data-split>Les règles du jeu, </span>
            <Highlight doodle={<Burst flip size={40} className="-top-8 -right-11" />}>noir sur blanc.</Highlight>
          </h1>
          <p data-reveal className="text-[15px] font-bold text-steel">
            Version [X.X] · mise à jour le [date]
          </p>
        </Container>
      </section>
      <section className="border-b-[3px] border-ink">
        <Container className="pt-[72px] pb-20 lg:pb-24">
          <LegalTabs sections={SECTIONS} />
        </Container>
      </section>
    </>
  );
}
