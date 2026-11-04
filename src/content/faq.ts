import type { FaqItem } from "@/components/features/faq-list";
import { CHALLENGE } from "@/config/challenge";

export type FaqCategory = "frais" | "participation" | "technique" | "evaluation";

export const FAQ_CATEGORIES: { key: FaqCategory | "all"; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "frais", label: "Frais et paiement" },
  { key: "participation", label: "Participation" },
  { key: "technique", label: "Technique" },
  { key: "evaluation", label: "Évaluation" },
];

export const FAQ: (FaqItem & { c: FaqCategory; home?: boolean })[] = [
  { c: "participation", home: true, q: "Où se déroule le challenge ?", a: "Entièrement en ligne, à distance. Vous participez depuis le lieu de votre choix avec votre ordinateur et une connexion Internet. Aucun déplacement n’est nécessaire." },
  { c: "frais", home: true, q: "Combien coûte l'inscription ?", a: `${CHALLENGE.fee}, payés par Mobile Money uniquement. C'est le seul frais demandé.` },
  { c: "frais", q: "Comment payer ?", a: "Par Mobile Money uniquement. Votre e-mail doit être confirmé avant le paiement, et un reçu vous est envoyé dès la confirmation." },
  { c: "frais", q: "Puis-je être remboursé ?", a: `Oui, jusqu'à ${CHALLENGE.refundDays} jours après votre inscription. Ensuite, les frais ne sont plus remboursables, sauf annulation du défi.` },
  { c: "frais", home: true, q: "Et si le défi est annulé ?", a: `Sous ${CHALLENGE.minParticipants} inscrits à la clôture, le défi est annulé : tout le monde est remboursé automatiquement et prévenu par e-mail.` },
  { c: "participation", home: true, q: "Solo ou en équipe ?", a: "Solo uniquement pour cette première édition : une personne, un compte, un dépôt GitHub." },
  { c: "participation", q: "Combien de places ?", a: `${CHALLENGE.seats} au maximum. Au-delà, vous rejoignez la liste d'attente et êtes prévenu automatiquement si une place se libère.` },
  { c: "participation", q: "Qui peut participer ?", a: "Tout développeur, de l'étudiant au senior. Un seul compte par e-mail, par identifiant GitHub et par téléphone." },
  { c: "technique", home: true, q: "Quel langage puis-je utiliser ?", a: "Langage, framework et base de données sont libres. API, base et cache tiennent dans 2 vCPU et 4 Go de RAM au total." },
  { c: "technique", home: true, q: "Les outils d'IA sont-ils autorisés ?", a: "Oui, à déclarer dans DECISIONS.md : quels outils, pour quelles parties du code." },
  { c: "technique", q: "Quelles ressources reçoit-on ?", a: "La documentation, les contrats OpenAPI et les ressources KrakenPay sont publiés à l’ouverture du défi. L’espace participant est prévu pour centraliser les clés de test personnelles après une inscription validée ; leur création dépend encore d’une API KrakenPay en cours d’ajout." },
  { c: "evaluation", home: true, q: "Qu'est-ce qui reste secret ?", a: "Les délais exacts, l'ordre des événements, les combinaisons de scénarios et les graines de charge de l'évaluation. Les comportements attendus, eux, sont tous publiés." },
  { c: "evaluation", q: "Comment livrer ?", a: "Depuis votre espace participant : l'URL du dépôt GitHub et le SHA du commit à évaluer. La dernière livraison avant la date limite compte." },
  { c: "evaluation", q: "Peut-on contester une note ?", a: "Oui, pendant 48 h après la publication des résultats, avec une reproduction du problème. La décision est finale et motivée." },
];
