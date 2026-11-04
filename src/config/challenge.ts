/**
 * Source de configuration unique du défi.
 * Toutes les dates sont en UTC (ISO 8601) et s'affichent en heure du Bénin (UTC+1).
 * Toutes les échéances sont publiées et doivent rester cohérentes entre les pages.
 */

export const CHALLENGE = {
  name: "Kraken",
  theme: "Sold Out",
  edition: "Édition 01",
  organizer: "HustlerLabs",
  tagline: "Votre back-end. Sous pression.",
  fee: "2 000 FCFA",
  seats: 100,
  devDays: 21,
  budget: { cpu: "2 vCPU", ram: "4 Go" },
  refundDays: 7,
  minParticipants: 10,
  whatsappUrl: "https://chat.whatsapp.com/CozY4La8aWh8J3O96KyN0M",
  contactEmail: "kraken@hustlerlabs.tech",
  timezone: "Africa/Porto-Novo",
} as const;

export type Step = {
  id: string;
  title: string;
  shortDate: string;
  when: string;
  desc: string;
  /** Instant UTC de l'étape. `null` = date à annoncer. */
  at: string | null;
};

export const STEPS: Step[] = [
  {
    id: "open",
    title: "Ouverture des inscriptions",
    shortDate: "2 nov.",
    when: "Lundi 2 novembre",
    desc: "100 places, 2 000 FCFA par Mobile Money.",
    at: "2026-11-01T23:00:00Z",
  },
  {
    id: "close",
    title: "Clôture des inscriptions",
    shortDate: "9 nov.",
    when: "Lundi 9 novembre, 23 h 59",
    desc: "Annonce des lots définitifs des trois premiers.",
    at: "2026-11-09T22:59:00Z",
  },
  {
    id: "start",
    title: "Ouverture du défi",
    shortDate: "10 nov.",
    when: "Mardi 10 novembre",
    desc: "Documentation publiée, clés KrakenPay actives.",
    at: "2026-11-09T23:00:00Z",
  },
  {
    id: "deadline",
    title: "Date limite de livraison",
    shortDate: "30 nov.",
    when: "Lundi 30 novembre, 23 h 59",
    desc: "Dépôt GitHub et SHA du commit. Verrouillage à la seconde.",
    at: "2026-11-30T22:59:00Z",
  },
  {
    id: "eval",
    title: "Évaluation",
    shortDate: "1 → 7 déc.",
    when: "Du 1er au 7 décembre",
    desc: "Banc de test automatique sur VM jetable.",
    at: "2026-11-30T23:00:00Z",
  },
  {
    id: "results",
    title: "Publication des résultats",
    shortDate: "8 déc.",
    when: "Mardi 8 décembre",
    desc: "Classement public et détail privé par participant.",
    at: "2026-12-07T23:00:00Z",
  },
  {
    id: "disputes",
    title: "Fin des contestations",
    shortDate: "10 déc.",
    when: "Jeudi 10 décembre",
    desc: "Fenêtre de 48 h, puis journal des tests publié.",
    at: "2026-12-10T22:59:00Z",
  },
];

export const NAV = [
  { href: "/le-defi", label: "Le défi" },
  { href: "/regles", label: "Règles" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/prix", label: "Prix" },
  { href: "/documentation", label: "Docs" },
  { href: "/faq", label: "FAQ" },
] as const;

/** Prochaine étape datée à partir d'un instant donné. */
export function nextStep(now: number): Step {
  const dated = STEPS.filter((s) => s.at !== null);
  return dated.find((s) => Date.parse(s.at as string) > now) ?? dated[dated.length - 1];
}
