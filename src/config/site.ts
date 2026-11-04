import type { Metadata } from "next";

/**
 * URL publique du site, utilisée pour les liens absolus (Open Graph, sitemap, canonical).
 * Peut être surchargée par NEXT_PUBLIC_SITE_URL (ex. environnement de recette).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kraken.hustlerlabs.tech").replace(/\/$/, "");

export const SITE = {
  name: "Kraken",
  shortName: "Kraken",
  tagline: "Votre back-end. Sous pression.",
  description:
    "Kraken, défi back-end de HustlerLabs. Pour l'édition 01, thème Sold Out : construisez la billetterie qui tient quand tout le monde veut le dernier billet. 100 places, 2 000 FCFA, solo, langage libre, 21 jours.",
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
