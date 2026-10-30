import type { Metadata } from "next";

/**
 * URL publique du site, utilisée pour les liens absolus (Open Graph, sitemap, canonical).
 * À définir via NEXT_PUBLIC_SITE_URL dès que le domaine est confirmé.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const SITE = {
  name: "Kraken : Sold Out",
  shortName: "Kraken",
  tagline: "Votre back-end. Sous pression.",
  description:
    "Défi back-end de HustlerLabs : construisez la billetterie qui tient quand tout le monde veut le dernier billet. 100 places, 2 000 FCFA, solo, langage libre, 21 jours.",
  locale: "fr_FR",
  organizer: "HustlerLabs",
  keywords: [
    "Kraken",
    "Sold Out",
    "HustlerLabs",
    "défi back-end",
    "challenge développeur",
    "hackathon",
    "billetterie",
    "concurrence",
    "idempotence",
    "webhooks",
    "Bénin",
    "Afrique",
  ],
} as const;

/** Métadonnées complètes d'une page (Open Graph et Twitter inclus, image générée par la route). */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const fullTitle = `${title} · ${SITE.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      siteName: SITE.name,
      url: path,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
