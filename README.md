# Kraken : Sold Out · Vitrine

Site vitrine du défi back-end **Kraken : Sold Out** (Kraken by HustlerLabs), en néo-brutalisme : cards distordues et arrondies, stickers, dessins à la main, animations GSAP.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [GSAP 3](https://gsap.com) + [`@gsap/react`](https://gsap.com/resources/React/) (ScrollTrigger, SplitText)
- Icônes animées [lucide-animated](https://lucide-animated.com) (licence MIT, copiées dans `src/components/icons`, s'appuient sur `motion`)
- Police Manrope (kit graphique, SIL OFL 1.1) chargée en local

## Démarrer

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
npm run lint
```

## Pages

| Route | Écran |
| --- | --- |
| `/` | Accueil |
| `/le-defi` | Le défi |
| `/regles` | Règles et barème |
| `/calendrier` | Calendrier |
| `/prix` | Prix et certificats |
| `/documentation` | Documentation |
| `/faq` | FAQ |
| `/organisateur` | Organisateur et contact |
| `/mentions` | Mentions et conditions |
| `/classement` | Classement |

## Structure

```
src/
  app/                    pages (une route par écran)
  config/challenge.ts     source unique : dates, places, frais, navigation
  content/faq.ts          questions de la FAQ
  components/
    layout/               en-tête (menu mobile), pied de page, bandeau défilant
    motion/               PageMotion, Pop, AnimatedIcon, hook de survol
    features/             compte à rebours, calendrier, FAQ, onglets légaux, formulaire
    ui/                   bouton, stickers, pastilles, dessins SVG
    icons/                icônes lucide-animated
```

## SEO et partage

- Favicon (`src/app/favicon.ico`, `icon.svg`), icône Apple et icônes du manifeste (`public/icons`)
- Métadonnées complètes par page via `pageMetadata()` (`src/config/site.ts`) : titre, description, canonical, Open Graph, Twitter
- Images de partage générées au build pour chaque page (`opengraph-image.tsx` / `twitter-image.tsx`, rendu commun dans `src/lib/og.tsx`)
- `manifest.webmanifest`, `sitemap.xml`, `robots.txt` et données structurées schema.org `Event`
- Domaine : `https://kraken.hustlerlabs.tech` (surchargeable par `NEXT_PUBLIC_SITE_URL`, voir `.env.example`)

## Animations

Tout est piloté par `src/components/motion/page-motion.tsx`, placé **dans chaque page** (il ne s'exécute qu'une fois la page hydratée), via des attributs `data-*` :

| Attribut | Effet |
| --- | --- |
| `data-reveal` | Fondu et montée à l'entrée à l'écran, rejoué en remontant |
| `data-pop` | Card qui « pop » (échelle, rotation, rebond) à l'entrée à l'écran, rejoué en remontant |
| `data-split` | Titre découpé en lettres qui tombent (SplitText) |
| `data-slam` | Mot surligné qui s'écrase |
| `data-stamp` | Sticker tamponné au scroll |
| `data-fill` | Barre qui se remplit au scroll |
| `data-float` | Dessins SVG animés en boucle (`burst`, `star`, `squiggle`, `arrow`) |

Composants dédiés :

- **`Pop`** : enveloppe des cards à deux couches (apparition / survol) pour que les deux animations ne se gênent pas. Déclenche aussi les icônes animées qu'elle contient. La distorsion CSS reste sur l'enfant.
- **`Marquee`** : bandeau défilant infini.
- **`Button`** : se soulève au survol, s'écrase au clic, son icône s'anime.
- **Calendrier** : la card qui traverse le centre de l'écran se surélève, puis se repose.
- **FAQ** : la question au centre de l'écran s'ouvre automatiquement, les autres se referment ; le clic reste possible.
- **Compte à rebours** : chiffres qui basculent à chaque changement.

`prefers-reduced-motion` est respecté : les animations sont coupées et le contenu affiché directement.

## À compléter

Les informations encore inconnues sont entre crochets dans le code : `[XX]` (places restantes, `CHALLENGE.seatsLeft`), `[DATE]`, `[LOT À ANNONCER]`, `[contact@domaine]`, présentation de HustlerLabs, mentions légales, classement. Le formulaire de contact et le lien WhatsApp ne sont pas encore branchés. Le calendrier de `src/config/challenge.ts` est encore « proposé ».
