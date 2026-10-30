import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageMotion } from "@/components/motion/page-motion";

import "./globals.css";

const manrope = localFont({
  src: "../fonts/Manrope-variable.ttf",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kraken.example"),
  title: {
    default: "Kraken : Sold Out · Votre back-end. Sous pression.",
    template: "%s · Kraken : Sold Out",
  },
  description:
    "Défi back-end de HustlerLabs : construisez la billetterie qui tient quand tout le monde veut le dernier billet. 100 places, 2 000 FCFA, solo, langage libre.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Kraken : Sold Out",
    title: "Kraken : Sold Out · Votre back-end. Sous pression.",
    description: "La billetterie qui tient quand tout le monde veut le dernier billet. 21 jours, un dépôt, un banc de test.",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/brand/kraken-symbole-noir.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0047FF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <PageMotion>
          <Header />
          <main className="flex-1 overflow-hidden">{children}</main>
          <Footer />
        </PageMotion>
      </body>
    </html>
  );
}
