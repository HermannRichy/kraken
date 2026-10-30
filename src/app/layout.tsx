import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { BackToTop } from "@/components/layout/back-to-top";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CHALLENGE, STEPS } from "@/config/challenge";
import { SITE, SITE_URL } from "@/config/site";

import "./globals.css";

const manrope = localFont({
  src: "../fonts/Manrope-variable.ttf",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.organizer }],
  creator: SITE.organizer,
  publisher: SITE.organizer,
  category: "technology",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    url: "/",
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
  },
  appleWebApp: { capable: true, title: SITE.shortName, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0047FF",
  colorScheme: "light",
};

const start = STEPS.find((s) => s.id === "start")?.at;
const end = STEPS.find((s) => s.id === "deadline")?.at;

/** Données structurées schema.org pour les moteurs de recherche. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: SITE.name,
  description: SITE.description,
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  startDate: start,
  endDate: end,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  location: { "@type": "VirtualLocation", url: SITE_URL },
  inLanguage: "fr",
  maximumAttendeeCapacity: CHALLENGE.seats,
  organizer: { "@type": "Organization", name: SITE.organizer, url: SITE_URL },
  offers: {
    "@type": "Offer",
    price: 2000,
    priceCurrency: "XOF",
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/#inscription`,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
