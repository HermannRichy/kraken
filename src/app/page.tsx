import Image from "next/image";

import { PageMotion } from "@/components/motion/page-motion";
import { CalendarGrid } from "@/components/features/calendar";
import { Countdown } from "@/components/features/countdown";
import { FaqList } from "@/components/features/faq-list";
import { Marquee } from "@/components/layout/marquee";
import { AnimatedIcon } from "@/components/motion/animated-icon";
import { Pop } from "@/components/motion/pop";
import { Button } from "@/components/ui/button";
import { Burst, CurlyArrow, Squiggle, Star } from "@/components/ui/doodles";
import { Chip, Container, H2, Highlight, IconDot, Sticker } from "@/components/ui/primitives";
import { CHALLENGE } from "@/config/challenge";
import { FAQ } from "@/content/faq";
import { cn } from "@/lib/utils";

const CHALLENGES = [
  {
    icon: "users",
    title: "Concurrence",
    text: "1 000 demandes simultanées sur 1 seul billet. Ventes ≤ stock, toujours.",
    card: "bg-kraken text-white shadow-[8px_8px_0_#000]",
    dot: "black",
    tilt: "distort-a",
    sticker: { label: "1 000\n→ 1", tone: "white", variant: "tag", cls: "-top-5 right-4 rotate-[9deg]" },
  },
  {
    icon: "copy",
    title: "Double débit",
    text: "Double clic, rejeu, retry : une clé d'idempotence débite une seule fois.",
    card: "bg-white text-ink shadow-[8px_8px_0_#000]",
    dot: "black",
    tilt: "distort-b",
    muted: true,
    sticker: { label: "Payé\nune\nfois.", tone: "black", variant: "torn", cls: "top-1/2 right-3 -mt-12 -rotate-[7deg]" },
  },
  {
    icon: "webhook",
    title: "Webhooks",
    text: "Forgés, rejoués, dupliqués, dans le désordre. Aucun statut qui recule.",
    card: "bg-ink text-white shadow-[8px_8px_0_#0047FF]",
    dot: "white",
    tilt: "distort-c",
    sticker: { label: "whsec_\nvérifié", tone: "blue", variant: "tag", cls: "-top-5 right-5 -rotate-[8deg]" },
  },
  {
    icon: "server-crash",
    title: "Pannes",
    text: "L'API puis la base tombent en pleine charge. Aucun billet fantôme.",
    card: "bg-paper text-ink shadow-[8px_8px_0_#000]",
    dot: "black",
    tilt: "distort-d",
    muted: true,
    sticker: { label: "Kill\n-9\nOK", tone: "white", variant: "tag", cls: "top-1/2 right-4 -mt-11 rotate-[10deg]" },
  },
] as const;

const GATES = [
  ["G1 · Aucune survente", "bg-white text-ink -rotate-2"],
  ["G2 · Aucun double débit", "bg-kraken text-white rotate-[1.5deg]"],
  ["G3 · Webhooks sûrs", "bg-ink text-white -rotate-1"],
  ["G4 · Contrôle d'accès", "bg-ink text-white rotate-2"],
  ["G5 · Reprise après panne", "bg-white text-ink -rotate-[2.5deg]"],
  ["G6 · Livraison conforme", "bg-kraken text-white rotate-1"],
] as const;

const SCORES = [
  ["Correction et concurrence", 30, "bg-kraken"],
  ["Paiements, idempotence, webhooks", 20, "bg-kraken"],
  ["Performance", 20, "bg-ink"],
  ["Résilience et reprise", 10, "bg-ink"],
  ["Sécurité", 10, "bg-ink"],
  ["Qualité, tests, documentation", 10, "bg-ink"],
] as const;

const STEPS = [
  { n: "01", t: "Inscrivez-vous", d: "2 000 FCFA par Mobile Money. Un compte, un dépôt.", cls: "bg-paper" },
  { n: "02", t: "Recevez vos clés", d: "sk_test_kraken_… et votre secret de webhook.", cls: "bg-white" },
  { n: "03", t: "Construisez 21 jours", d: "API + base + cache dans 2 vCPU et 4 Go de RAM.", cls: "bg-paper" },
  { n: "04", t: "Livrez un SHA", d: "Le banc de test rejoue tout sur une VM jetable.", cls: "bg-ink text-white" },
];

export default function Home() {
  const seats = CHALLENGE.seatsLeft;
  const fill = seats === null ? 62 : Math.round(((CHALLENGE.seats - seats) / CHALLENGE.seats) * 100);

  return (
    <PageMotion>
      {/* HERO */}
      <section id="accueil" className="relative border-b-[3px] border-ink bg-paper">
        <Container className="flex flex-wrap items-center gap-14 pt-10 pb-16 lg:pt-[72px] lg:pb-24">
          <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-6 lg:gap-7">
            <div className="flex flex-wrap gap-2.5" data-reveal>
              <span className="inline-flex -rotate-2 items-center gap-2 rounded-full border-[3px] border-ink bg-white px-3.5 py-1.5 text-xs font-extrabold shadow-[4px_4px_0_#000] sm:text-sm">
                <span className="size-2.5 rounded-full border-2 border-ink bg-kraken" />
                {CHALLENGE.edition} · Sold Out
              </span>
              <span className="inline-flex rotate-[1.5deg] rounded-full border-[3px] border-ink bg-ink px-3.5 py-1.5 text-xs font-extrabold text-white sm:text-sm">
                Défi back-end · Solo
              </span>
            </div>

            <h1 className="text-[2.8rem] leading-[0.98] font-extrabold tracking-[-0.045em] sm:text-7xl lg:text-[104px] lg:leading-[0.95]">
              <span data-split className="block">
                Votre back-end.
              </span>
              <span className="mt-3 inline-block lg:mt-4">
                <Highlight
                  className="lg:rounded-[28px] lg:px-6 lg:pb-3.5 lg:shadow-[10px_10px_0_#000]"
                  doodle={
                    <>
                      <Burst flip size={44} className="-top-10 -right-12 lg:-top-11 lg:-right-14" />
                      <Star size={30} className="-bottom-6 -left-6" />
                    </>
                  }
                >
                  Sous pression.
                </Highlight>
              </span>
            </h1>

            <p data-reveal className="mt-3 max-w-[560px] text-[17px] leading-normal font-semibold sm:text-[21px]">
              Construisez la billetterie qui tient quand tout le monde veut le dernier billet. Aucun billet vendu deux fois, aucun paiement
              débité deux fois, un service qui se relève après une panne.
            </p>

            <div data-reveal className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative">
                <Button href="#inscription" size="lg" iconLeft="ticket" full className="text-base whitespace-nowrap sm:w-auto sm:text-lg">
                  Prendre ma place · {CHALLENGE.fee}
                </Button>
                <Star size={30} className="-top-4 -right-4" />
              </div>
              <Button href="/le-defi" variant="white" size="lg" icon="arrow-up-right" full className="sm:w-auto">
                Lire le défi
              </Button>
            </div>
            <p data-reveal className="text-center text-[13px] font-semibold text-steel sm:text-left sm:text-sm">
              Paiement Mobile Money uniquement · Remboursable jusqu&apos;à 7 jours après l&apos;inscription
            </p>
          </div>

          {/* Pile de cards */}
          <div className="relative flex min-w-0 flex-[1_1_440px] flex-col gap-10 pt-6 lg:block lg:h-[600px] lg:pt-0">
            <div className="relative lg:absolute lg:inset-x-2.5 lg:top-2.5 lg:left-[30px]">
              <div className="distort-back absolute inset-x-5 top-6 -bottom-3 rounded-[32px] border-4 border-ink bg-mist lg:top-6 lg:right-[-10px] lg:left-5 lg:h-[300px]" aria-hidden="true" />
              <Pop lift={-12}>
                <div className="distort-hero overflow-hidden rounded-[28px] border-4 border-ink bg-white shadow-[12px_12px_0_#000] lg:rounded-[32px]">
                  <div className="flex items-center justify-between bg-ink px-5 py-4 text-white lg:px-6">
                    <Image src="/brand/kraken-horizontal-blanc.svg" alt="Kraken" width={110} height={34} className="h-7 w-[91px] lg:h-[34px] lg:w-[110px]" />
                    <span className="text-[11px] font-extrabold tracking-[0.1em] lg:text-[13px]">ÉDITION 01</span>
                  </div>
                  <div className="flex flex-col gap-4 p-5 lg:px-6 lg:pt-6 lg:pb-5">
                    <div className="text-[11px] font-extrabold tracking-[0.1em] text-steel lg:text-[13px]">BILLET D&apos;ACCÈS</div>
                    <div className="text-[34px] leading-none font-extrabold tracking-[-0.03em] lg:text-[44px]">Sold Out</div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        ["DÉVELOPPEMENT", "21 jours"],
                        ["FORMAT", "Solo"],
                        ["FRAIS", CHALLENGE.fee],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div className="text-[10px] font-bold text-steel lg:text-xs">{k}</div>
                          <div className="text-sm font-extrabold lg:text-base">{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="-mx-5 mt-1 border-t-[3px] border-dashed border-ink lg:-mx-6" />
                    <div className="flex items-end justify-between gap-4">
                      <div className="barcode h-10 flex-1 lg:h-[54px]" aria-hidden="true" />
                      <div className="font-mono text-[13px] font-extrabold">N° 100/100</div>
                    </div>
                  </div>
                </div>
              </Pop>
              <Sticker tone="blue" className="-top-6 -left-2 -rotate-[13deg] px-4 py-3 text-base lg:-top-[18px] lg:-left-[30px] lg:text-[22px]">
                Le dernier
                <br />
                billet est
                <br />à vous
              </Sticker>
              <Burst size={40} className="-top-9 left-36 lg:left-[156px]" />
              <Sticker variant="torn" tone="black" className="top-24 right-2 rotate-[8deg] text-xl lg:top-[186px] lg:right-4 lg:text-[26px]">
                Sold
                <br />
                out
              </Sticker>
            </div>

            <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr] lg:block">
              <Pop className="z-20 lg:absolute lg:top-[352px] lg:left-0 lg:w-[350px]">
                <div className="relative rounded-[28px] border-4 border-ink bg-ink p-5 text-white shadow-[10px_10px_0_#0047FF] [transform:perspective(1000px)_rotateY(5deg)_rotateZ(-2deg)] lg:p-6 lg:[transform:perspective(1000px)_rotateY(10deg)_rotateX(-4deg)_rotateZ(-4deg)]">
                  <div className="mb-3.5 flex items-center gap-2.5 text-xs font-extrabold tracking-[0.08em] lg:text-[13px]">
                    <AnimatedIcon name="timer" size={20} loop={4000} />
                    CLÔTURE DES INSCRIPTIONS
                  </div>
                  <Countdown stepId="close" />
                  <Burst size={40} className="-top-10 -left-10" />
                </div>
              </Pop>

              <Pop className="lg:absolute lg:top-[430px] lg:-right-3 lg:w-[240px]">
                <div className="relative flex flex-col gap-2.5 rounded-[28px] border-4 border-ink bg-kraken p-5 text-white shadow-[10px_10px_0_#000] [transform:perspective(1000px)_rotateY(-6deg)_rotateZ(2deg)] lg:p-[22px] lg:[transform:perspective(1000px)_rotateY(-12deg)_rotateX(5deg)_rotateZ(5deg)]">
                  <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.08em] lg:text-[13px]">
                    <AnimatedIcon name="users" size={20} />
                    PLACES RESTANTES
                  </div>
                  <div className="text-5xl leading-none font-extrabold tracking-[-0.03em] lg:text-[52px]">
                    {seats ?? "[XX]"}
                    <span className="text-2xl">/{CHALLENGE.seats}</span>
                  </div>
                  <div className="h-[18px] overflow-hidden rounded-full border-[3px] border-ink bg-white">
                    <div data-fill className="h-full rounded-full bg-ink" style={{ width: `${fill}%` }} />
                  </div>
                  <div className="text-[13px] font-semibold">Au-delà : liste d&apos;attente</div>
                  <Star size={34} className="-top-6 -right-5" />
                </div>
              </Pop>
            </div>
          </div>
        </Container>
      </section>

      {/* Bandeaux croisés */}
      <div className="relative h-[110px] overflow-hidden border-b-[3px] border-ink bg-white lg:h-[150px]" aria-hidden="true">
        <Marquee
          items={["Aucune survente", "Aucun double débit", "Webhooks signés", "Reprise après panne"]}
          className="absolute -inset-x-10 top-5 rotate-[3deg] border-y-[3px] border-ink bg-ink py-2.5 text-base font-extrabold text-white lg:top-[30px] lg:rotate-2 lg:py-3.5 lg:text-[22px]"
          speed={26}
        />
        <Marquee
          items={["1 000 demandes", "1 billet", "1 seul gagnant", "La justesse avant la vitesse"]}
          className="absolute -inset-x-10 top-11 -rotate-[3.5deg] border-y-[3px] border-ink bg-kraken py-2.5 text-base font-extrabold text-white lg:top-[58px] lg:-rotate-[2.5deg] lg:py-3.5 lg:text-[22px]"
          separatorClassName="text-ink"
          reverse
          speed={22}
        />
      </div>

      {/* LE DÉFI */}
      <section id="defi" className="border-b-[3px] border-ink">
        <Container className="flex flex-col gap-12 py-16 lg:gap-14 lg:py-[104px]">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-[18px]">
              <Chip doodle="burst">01 · Le défi</Chip>
              <H2 className="lg:text-[64px]">Le jour où tout le monde veut le dernier billet.</H2>
            </div>
            <p data-reveal className="min-w-0 flex-[1_1_360px] text-base leading-relaxed font-semibold text-steel lg:text-lg">
              Vous livrez une API HTTP de billetterie qui respecte le contrat, un dépôt GitHub qui démarre en une commande, et vous payez via
              KrakenPay, le faux prestataire fourni. Langage, framework et base de données : libres.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-11 px-1 pt-6 pb-3 lg:grid-cols-2 lg:px-3">
            {CHALLENGES.map((c) => (
              <Pop key={c.title}>
                <article
                  className={cn(
                    "flex min-h-[150px] items-center gap-4 rounded-[26px] border-[3px] border-ink py-6 pr-24 pl-5 sm:gap-5 sm:rounded-[30px] sm:py-[30px] sm:pr-36 sm:pl-7",
                    c.card,
                    c.tilt,
                  )}
                >
                  <IconDot tone={c.dot}>
                    <AnimatedIcon name={c.icon} size={28} />
                  </IconDot>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[22px] font-extrabold tracking-[-0.03em] sm:text-[28px]">{c.title}</h3>
                    <p className={cn("text-sm leading-snug font-semibold sm:text-base", "muted" in c && c.muted && "text-steel", c.dot === "white" && "text-mist")}>
                      {c.text}
                    </p>
                  </div>
                </article>
                <Sticker variant={c.sticker.variant} tone={c.sticker.tone} className={cn("text-sm whitespace-pre-line sm:text-lg", c.sticker.cls)}>
                  {c.sticker.label}
                </Sticker>
              </Pop>
            ))}
          </div>

          <div data-reveal className="mt-6 flex flex-wrap overflow-hidden rounded-[28px] border-[3px] border-ink shadow-[8px_8px_0_#000]">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className={cn(
                  "flex flex-[1_1_220px] flex-col gap-2.5 border-ink p-6",
                  i < STEPS.length - 1 && "border-b-[3px] sm:border-r-[3px] sm:border-b-0",
                  s.cls,
                )}
              >
                <div className={cn("text-[44px] leading-none font-extrabold", i === 3 ? "text-white" : "text-kraken")}>{s.n}</div>
                <div className="text-[19px] font-extrabold">{s.t}</div>
                <div className={cn("text-[15px] leading-normal font-semibold", i === 3 ? "text-mist" : "text-steel")}>{s.d}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* RÈGLES */}
      <section id="regles" className="border-b-[3px] border-ink bg-ink text-white">
        <Container className="flex flex-wrap gap-14 py-16 lg:py-[104px]">
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-[22px]">
            <Chip dark doodle="star">02 · Règles et barème</Chip>
            <H2 dark className="lg:text-[64px]">
              Une vente en trop, et c&apos;est fini.
            </H2>
            <p data-reveal className="text-base leading-relaxed font-semibold text-mist lg:text-lg">
              Six portes éliminatoires filtrent avant tout classement. Échouer à une seule exclut du podium, même avec la meilleure latence.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {GATES.map(([label, cls]) => (
                <span key={label} data-pop className={cn("rounded-2xl border-[3px] border-white px-4 py-2.5 text-[15px] font-extrabold", cls)}>
                  {label}
                </span>
              ))}
            </div>
            <div data-reveal className="self-start">
              <Button href="/regles" variant="black-on-blue" icon="arrow-right" className="border-white">
                Lire le règlement complet
              </Button>
            </div>
          </div>

          <Pop className="min-w-0 flex-[1_1_480px]" lift={-8} scale={1.02}>
            <div className="relative flex flex-col gap-[18px] rounded-[32px] border-4 border-white bg-white p-6 text-ink shadow-[12px_12px_0_#0047FF] [transform:perspective(1400px)_rotateY(-8deg)_rotateX(3deg)_rotateZ(1.5deg)] sm:p-8">
              <div className="flex items-baseline justify-between">
                <div className="text-[22px] font-extrabold">Barème</div>
                <div className="relative text-5xl font-extrabold tracking-[-0.03em]">
                  /100
                  <Squiggle color="#0047FF" width={100} className="-bottom-2 -left-1.5" />
                </div>
              </div>
              <div className="flex flex-col gap-3.5">
                {SCORES.map(([label, pts, bar]) => (
                  <div key={label}>
                    <div className="mb-1.5 flex justify-between gap-3 text-[15px] font-bold">
                      <span>{label}</span>
                      <span>{pts}</span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full border-[3px] border-ink">
                      <div data-fill className={cn("h-full", bar)} style={{ width: `${(pts / 30) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-sm leading-normal font-semibold text-steel">
                Seule la réponse correcte compte. Un rejet rapide « stock épuisé » ne rapporte que si le stock l&apos;était vraiment.
              </p>
            </div>
          </Pop>
        </Container>
      </section>

      {/* CALENDRIER */}
      <section id="calendrier" className="border-b-[3px] border-ink bg-paper">
        <Container className="flex flex-col gap-12 py-16 lg:py-[104px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-[18px]">
              <Chip doodle="squiggle">03 · Calendrier</Chip>
              <H2 className="lg:text-[64px]">21 jours. Pas une seconde de plus.</H2>
            </div>
            <span data-reveal className="inline-flex items-center gap-2 text-sm font-bold text-steel">
              <AnimatedIcon name="calendar-days" size={18} />
              Heure du Bénin (UTC+1)
            </span>
          </div>
          <CalendarGrid />
        </Container>
      </section>

      {/* PRIX */}
      <section id="prix" className="border-b-[3px] border-ink">
        <Container className="flex flex-wrap items-center gap-14 py-16 lg:py-[104px]">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-[22px]">
            <Chip doodle="burst">04 · Prix et certificats</Chip>
            <H2 className="lg:text-[64px]">Livrez. On vous le certifie.</H2>
            <p data-reveal className="text-base leading-relaxed font-semibold text-steel lg:text-lg">
              Un certificat vérifiable par QR code pour chaque participant qui livre avant la date limite. Des prix pour les trois premiers,
              selon le nombre de participants : les lots définitifs sont annoncés à la clôture des inscriptions, le 9 novembre.
            </p>
          </div>
          <Podium />
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b-[3px] border-ink bg-paper">
        <div className="mx-auto flex max-w-[960px] flex-col gap-10 px-4 py-16 sm:px-6 lg:px-10 lg:py-[104px]">
          <div className="flex flex-col gap-[18px]">
            <Chip doodle="star-blue">05 · FAQ</Chip>
            <H2 className="lg:text-[64px]">Avant de payer quoi que ce soit.</H2>
          </div>
          <FaqList items={FAQ.filter((f) => f.home).map(({ q, a }) => ({ q, a }))} />
          <div data-reveal className="self-start">
            <Button href="/faq" variant="white" icon="circle-help">
              Toutes les questions
            </Button>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section id="inscription" className="px-4 py-16 sm:px-6 lg:px-10 lg:py-[104px]">
        <Pop className="mx-auto max-w-[1200px]" lift={-6} scale={1.01}>
          <div className="relative overflow-hidden rounded-[30px] border-4 border-ink bg-kraken text-white shadow-[14px_14px_0_#000] [transform:perspective(1800px)_rotateY(-5deg)_rotateX(3deg)_rotateZ(-1deg)] lg:rounded-[40px]">
            <Image
              src="/brand/kraken-symbole-blanc.svg"
              alt=""
              aria-hidden="true"
              width={560}
              height={560}
              className="pointer-events-none absolute -right-28 -bottom-32 size-[300px] lg:-right-[150px] lg:-bottom-[190px] lg:size-[560px]"
            />
            <div className="relative flex max-w-[660px] flex-col gap-6 px-6 py-10 sm:px-12 lg:px-16 lg:py-[72px]">
              <h2 className="relative text-[2.4rem] leading-none font-extrabold tracking-[-0.045em] lg:text-[72px] lg:leading-[0.98]">
                100 places. Le dernier billet est peut-être le vôtre.
                <Burst color="#fff" size={44} className="-top-8 right-0 hidden lg:block" />
              </h2>
              <p className="text-[15px] leading-normal font-semibold lg:text-[19px]">
                2 000 FCFA · Mobile Money · Solo · Langage libre. Au-delà de 100 inscrits, liste d&apos;attente automatique.
              </p>
              <div className="relative flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <CurlyArrow color="#fff" className="-top-9 -left-14 hidden lg:block" />
                <Button href="#formulaire" variant="white" size="lg" icon="arrow-right">
                  S&apos;inscrire maintenant
                </Button>
                <Button href={CHALLENGE.whatsappUrl} variant="black-on-blue" size="lg" icon="send">
                  Rejoindre la communauté WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </Pop>
      </section>
    </PageMotion>
  );
}

function Podium() {
  return (
    <div className="flex min-w-0 flex-[1_1_520px] items-end justify-center gap-3 px-1.5 pt-12 sm:gap-[18px]">
      <Pop className="flex-1">
        <div className="flex h-[150px] flex-col items-center justify-center gap-2.5 rounded-t-3xl rounded-b-xl border-[3px] border-ink bg-white shadow-[6px_6px_0_#000] [transform:perspective(800px)_rotateY(10deg)_rotateZ(-3deg)] sm:h-[230px]">
          <AnimatedIcon name="sparkles" size={36} />
          <div className="text-4xl leading-none font-extrabold sm:text-[56px]">2</div>
        </div>
      </Pop>
      <Pop className="flex-1">
        <div className="relative flex h-[210px] flex-col items-center justify-center gap-2.5 rounded-t-3xl rounded-b-xl border-[3px] border-ink bg-kraken text-white shadow-[8px_8px_0_#000] [transform:perspective(800px)_rotateY(-6deg)_rotateZ(2deg)] sm:h-80">
          <AnimatedIcon name="party-popper" size={44} loop={3500} />
          <div className="text-[56px] leading-none font-extrabold sm:text-[80px]">1</div>
          <Star size={40} className="-top-8 -left-6" />
          <Star size={26} color="#0047FF" className="top-8 -right-4" />
          <Burst flip size={40} className="-top-12 right-2.5" />
        </div>
      </Pop>
      <Pop className="flex-1">
        <div className="flex h-[120px] flex-col items-center justify-center gap-2.5 rounded-t-3xl rounded-b-xl border-[3px] border-ink bg-ink text-white shadow-[6px_6px_0_#0047FF] [transform:perspective(800px)_rotateY(-10deg)_rotateZ(-1.5deg)] sm:h-[180px]">
          <AnimatedIcon name="sparkles" size={30} />
          <div className="text-[34px] leading-none font-extrabold sm:text-5xl">3</div>
        </div>
      </Pop>
    </div>
  );
}
