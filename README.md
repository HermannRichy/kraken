# Kraken : Sold Out

Site vitrine du défi back-end **Kraken : Sold Out** (Kraken by HustlerLabs), en néo-brutalisme : cards distordues et arrondies, stickers, dessins à la main, animations GSAP.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [GSAP 3](https://gsap.com) + [`@gsap/react`](https://gsap.com/resources/React/) (ScrollTrigger, SplitText)
- Icônes animées [lucide-animated](https://lucide-animated.com) (licence MIT, copiées dans `src/components/icons`, s'appuient sur `motion`)
- Police Manrope (kit graphique, SIL OFL 1.1) chargée en local
- PostgreSQL (Neon) + [Prisma 7](https://www.prisma.io) (adaptateur Neon / pg)
- [better-auth](https://www.better-auth.com) : lien magique (participants), mot de passe + TOTP obligatoire (équipe), rôles `admin`, `moderator`, `participant`
- Brevo (e-mails transactionnels), FeexPay (Mobile Money), Web Push (VAPID), sonner

## Démarrer

```bash
cp .env.example .env   # puis remplir les valeurs
pnpm install
pnpm db:migrate        # prisma migrate deploy
pnpm db:seed           # premier admin (FIRST_ADMIN_EMAIL)
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
pnpm lint
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

Les informations encore inconnues sont entre crochets dans le code : `[XX]` (places restantes, `CHALLENGE.seatsLeft`), `[DATE]`, `[LOT À ANNONCER]`, `[contact@domaine]`, présentation de HustlerLabs, mentions légales, classement. Le lien WhatsApp n'est pas encore branché. Le calendrier de `src/config/challenge.ts` est encore « proposé ».

## Back-end

### Parcours

1. `/inscription` : formulaire validé côté client et serveur (zod partagé), pot de miel, délai minimal, limitation par IP, vérification du compte GitHub en direct. Statut `pre_registered`.
2. E-mail de confirmation (lien valable 24 h) → connexion automatique sur `/espace`, statut `email_confirmed`.
3. `/espace` : paiement Mobile Money FeexPay (2 000 FCFA, clé d'idempotence, attribution des places sous verrou), suivi en direct, puis clés de test chiffrées (AES-256-GCM), révélation et régénération consignées. Invitation aux notifications push à l'arrivée.
4. Plus de place : liste d'attente automatique.

Espace participant (`/espace`) : interface avec barre latérale (tiroir sur mobile) : Accueil (avancement, prochaine étape, compte à rebours), Paiement (paiement et historique), Mes clés, Documentation, Notifications (activer, tester, désactiver sur l'appareil), Mon profil.

Connexion participant : `/connexion` (lien magique 15 min). Équipe : adresse secrète `/<ADMIN_PATH>` (mot de passe + double authentification obligatoire, configurée sur `/admin/securite`). Avec `ADMIN_PATH` défini, `/admin/connexion` et toute page `/admin` sans session répondent 404 ; l'adresse n'apparaît nulle part sur le site.

### Administration (`/admin`)

Tableau de bord, participants (recherche, filtres, fiche, notes, renvoi d'e-mails, retrait, disqualification, régénération des clés), export CSV (admin), équipe (invitations, rôles), réglages (nombre de places, état de la configuration). Toutes les actions sensibles sont journalisées (`AuditLog`).

| Rôle | Droits |
| --- | --- |
| `admin` | Tout, dont export, équipe, réglages |
| `moderator` | Lecture, notes, renvoi d'e-mails |
| `participant` | Son espace uniquement |

### Sécurité

En-têtes CSP, HSTS, COOP/CORP, `X-Frame-Options`, `Permissions-Policy` ; vérification d'origine sur les routes API ; limitation de débit en base (IP hachée avec sel, jamais stockée en clair) ; validation zod côté client et serveur ; Cloudflare Turnstile et champ piège sur l'inscription, le contact, le lien magique et la connexion de l'équipe ; sessions et 2FA better-auth ; ressources d'autrui renvoyées en 404 ; neutralisation des formules dans l'export CSV ; webhook FeexPay authentifié (comparaison à temps constant), statut revérifié auprès de l'API, traitement idempotent.

### Déploiement (Vercel + Neon)

1. Créer la base Neon : `DATABASE_URL` (poolée) et `DIRECT_URL` (directe).
2. Renseigner toutes les variables de `.env.example` dans Vercel.
3. `vercel env pull .env` puis `pnpm db:migrate` et `pnpm db:seed` (une fois).
   Avec `FIRST_ADMIN_PASSWORD` vide, le vrai admin active son compte lui-même : `/<ADMIN_PATH>` → « Première connexion : activer mon compte » → lien reçu sur `FIRST_ADMIN_EMAIL` → choix du mot de passe → double authentification.
   Si l'e-mail n'arrive pas : `pnpm admin:link` (ou `pnpm admin:link membre@domaine.com`) affiche un diagnostic (mot de passe, 2FA, Brevo, derniers e-mails) et génère un lien d'activation à usage unique, valable 1 h. Pour qu'une autre personne reprenne le compte depuis le début (nouveau mot de passe et nouvelle double authentification) : `pnpm admin:reset`.
4. **Brevo** : valider l'expéditeur `kraken@hustlerlabs.tech` et authentifier le domaine (SPF, DKIM, DMARC), puis créer une clé API.
5. **FeexPay** : webhook `https://kraken.hustlerlabs.tech/api/webhooks/feexpay`, en-tête `Authorization` de type Bearer = `FEEXPAY_WEBHOOK_SECRET`. `FEEXPAY_MODE=mock` simule les paiements en local (refus si le numéro finit par 00).
6. **Cron** : `vercel.json` appelle `/api/cron/reconcile` une fois par jour (3 h UTC, limite du plan Hobby) (Vercel envoie `Authorization: Bearer $CRON_SECRET`) pour rattraper les paiements sans webhook.
7. **Turnstile** : créer un widget (mode Managed) pour `kraken.hustlerlabs.tech`, renseigner `NEXT_PUBLIC_TURNSTILE_SITE_KEY` et `TURNSTILE_SECRET_KEY`, puis redéployer (la clé publique est intégrée à la compilation).
8. **Push** : `pnpm dlx web-push generate-vapid-keys`.

La migration initiale (`prisma/migrations`) a été écrite à la main : la vérifier une fois avec `pnpm prisma migrate dev` sur une base vide. En local, `EMAIL_LOG_TO_CONSOLE=true` affiche les e-mails dans la console au lieu de les envoyer.

Les clés de test sont pour l'instant générées localement ; à brancher sur `POST /_admin/keys` de KrakenPay dès que l'endpoint est disponible (`src/lib/server/participants.ts`).
