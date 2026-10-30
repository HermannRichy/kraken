import type { Metadata } from "next";

import { PageMotion } from "@/components/motion/page-motion";
import { CtaBand } from "@/components/features/cta-band";
import { PageHero } from "@/components/features/page-hero";
import { AnimatedIcon } from "@/components/motion/animated-icon";
import { Pop } from "@/components/motion/pop";
import { Burst, Squiggle, Star } from "@/components/ui/doodles";
import { Chip, Container, H2, Highlight, IconDot, Sticker } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Le défi",
  description: "Construisez le back-end d'une billetterie qui ne vend jamais deux fois le dernier billet.",
  path: "/le-defi",
});

const DELIVERABLES = [
  { icon: "terminal", text: "Une API HTTP conforme au contrat", tone: "black" },
  { icon: "git-commit", text: "Un dépôt GitHub qui démarre en une commande", tone: "black" },
  { icon: "file-text", text: "Les fichiers déclaratifs obligatoires", tone: "blue" },
] as const;

const RULES = [
  {
    n: "1",
    title: "La justesse passe avant la vitesse.",
    text: "Une vente en trop vous écarte du podium, même avec la meilleure latence.",
    card: "bg-ink text-white shadow-[8px_8px_0_#0047FF]",
    num: "text-kraken",
    muted: "text-mist",
    tilt: "distort-a",
  },
  {
    n: "2",
    title: "La vérité vit dans un stockage durable.",
    text: "Un stock tenu seulement en mémoire est perdu au redémarrage.",
    card: "bg-white text-ink shadow-[8px_8px_0_#000]",
    num: "text-kraken",
    muted: "text-steel",
    tilt: "distort-b",
  },
  {
    n: "3",
    title: "Le contrat est la loi.",
    text: "Chemins, champs, codes HTTP et codes d'erreur. Une variante, même meilleure, est comptée comme une erreur.",
    card: "bg-kraken text-white shadow-[8px_8px_0_#000]",
    num: "text-white",
    muted: "",
    tilt: "distort-c",
  },
];

const STATES = [
  { label: "held", cls: "bg-white text-ink -rotate-2" },
  { label: "converted", cls: "bg-white text-ink rotate-[1.5deg]" },
  { label: "pending_payment", cls: "bg-ink text-white -rotate-1" },
  { label: "paid", cls: "bg-kraken text-white rotate-2 shadow-[5px_5px_0_#fff]" },
];

const FACTS = [
  { big: "10 min", text: "Durée d'une réservation. Le checkout ne la prolonge pas.", light: false, tilt: "distort-a" },
  { big: "1 à 4", text: "Billets par réservation, montant toujours calculé par le serveur.", light: false, tilt: "distort-b" },
  { big: "24 h", text: "Même Idempotency-Key et même corps = même réponse.", light: true, tilt: "distort-c" },
  { big: "Tout ou rien", text: "Une commande est honorée entièrement ou remboursée entièrement.", light: false, tilt: "distort-d" },
];

function WavyArrow() {
  return (
    <svg data-float="arrow" width="34" height="24" viewBox="0 0 34 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12 C10 4 20 18 30 12" />
      <path d="M24 6 L31 12 L24 18" />
    </svg>
  );
}

export default function DefiPage() {
  return (
    <PageMotion>
      <PageHero
        chip={<Chip doodle="burst">01 · Le défi</Chip>}
        title={
          <>
            <span data-split>Une billetterie qui ne vend </span>
            <Highlight doodle={<Burst flip size={40} className="-top-8 -right-11" />}>jamais</Highlight>
            <span data-split> deux fois le dernier billet.</span>
          </>
        }
        intro="Vous construisez le back-end d'une billetterie qui tient le jour où tout le monde veut le dernier billet : aucun billet vendu deux fois, aucun paiement débité deux fois, et un service qui se relève après une panne."
        aside={
          <div className="relative px-2.5 pt-8 pb-2.5">
            <Pop lift={-10}>
              <div className="flex flex-col gap-[18px] rounded-[30px] border-4 border-ink bg-white p-6 shadow-[12px_12px_0_#000] [transform:perspective(1100px)_rotateY(-10deg)_rotateX(5deg)_rotateZ(2.5deg)] sm:p-[30px]">
                <div className="text-[13px] font-extrabold tracking-[0.1em] text-steel">VOUS LIVREZ</div>
                {DELIVERABLES.map((d) => (
                  <div key={d.text} className="flex items-center gap-3.5">
                    <IconDot tone={d.tone} className="size-12 sm:size-12">
                      <AnimatedIcon name={d.icon} size={22} />
                    </IconDot>
                    <span className="text-base font-extrabold sm:text-lg">{d.text}</span>
                  </div>
                ))}
              </div>
            </Pop>
            <Sticker tone="blue" className="top-0 -left-1.5 -rotate-[11deg] text-base sm:text-lg">
              21 jours
              <br />
              chrono
            </Sticker>
            <Star size={44} className="right-0 -bottom-7" />
          </div>
        }
      />

      {/* Règles d'or */}
      <section className="border-b-[3px] border-ink">
        <Container className="flex flex-col gap-12 py-16 lg:py-24">
          <H2 className="max-w-[760px]">Trois règles d&apos;or. Aucune exception.</H2>
          <div className="grid grid-cols-1 gap-9 p-1.5 md:grid-cols-3">
            {RULES.map((r, i) => (
              <Pop key={r.n}>
                <article className={cn("flex min-h-[260px] flex-col gap-3.5 rounded-[30px] border-[3px] border-ink p-7 sm:p-[30px]", r.card, r.tilt)}>
                  <div className={cn("text-7xl leading-[0.9] font-extrabold", r.num)}>{r.n}</div>
                  <h3 className="text-2xl font-extrabold tracking-[-0.02em] sm:text-[26px]">{r.title}</h3>
                  <p className={cn("text-base leading-normal font-semibold", r.muted)}>{r.text}</p>
                </article>
                {i === 0 && (
                  <Sticker className="-top-5 right-4 rotate-[9deg] text-base">
                    Podium
                    <br />
                    perdu
                  </Sticker>
                )}
                {i === 1 && <Burst flip size={40} className="-top-7 right-2.5" />}
                {i === 2 && (
                  <Sticker variant="torn" tone="black" className="-top-5 right-3.5 -rotate-[8deg] text-base normal-case">
                    openapi
                    <br />
                    .yaml
                  </Sticker>
                )}
              </Pop>
            ))}
          </div>
        </Container>
      </section>

      {/* Cycle de vie */}
      <section className="border-b-[3px] border-ink bg-ink text-white">
        <Container className="flex flex-col gap-11 py-16 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-7">
            <H2 dark className="max-w-[700px]">
              La vie d&apos;une commande, sous la charge.
              <Squiggle color="#0047FF" width={140} className="-bottom-6 left-0" />
            </H2>
            <p data-reveal className="max-w-[460px] flex-[1_1_340px] text-base leading-relaxed font-semibold text-mist sm:text-[17px]">
              Le premier arrivé est le premier à obtenir une réservation, dans l&apos;ordre de validation en base. Ni l&apos;arrivée réseau ni le
              paiement ne comptent.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            {STATES.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3.5">
                <span data-pop className={cn("rounded-[18px] border-[3px] border-white px-5 py-4 font-mono text-base font-extrabold sm:text-lg", s.cls)}>
                  {s.label}
                </span>
                {i < STATES.length - 1 && <WavyArrow />}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FACTS.map((f) => (
              <Pop key={f.big} lift={-8}>
                <div
                  className={cn(
                    "flex h-full flex-col gap-2 rounded-3xl border-[3px] border-white p-[22px]",
                    f.tilt,
                    f.light ? "bg-white text-ink" : "bg-ink text-white",
                  )}
                >
                  <div className="text-[40px] leading-none font-extrabold">{f.big}</div>
                  <div className={cn("text-[15px] leading-normal font-semibold", f.light ? "text-steel" : "text-mist")}>{f.text}</div>
                </div>
              </Pop>
            ))}
          </div>
        </Container>
      </section>

      {/* Stack */}
      <section className="border-b-[3px] border-ink">
        <Container className="flex flex-wrap items-center gap-14 py-16 lg:py-24">
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-[22px]">
            <H2>Votre stack. Notre budget.</H2>
            <p data-reveal className="text-base leading-relaxed font-semibold text-steel sm:text-lg">
              Langage, framework et base de données : libres. Seule contrainte, tout tient dans 2 vCPU et 4 Go de RAM au total. Les paiements
              passent par KrakenPay, le faux prestataire fourni en image Docker. Vous ne le modifiez pas.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {[
                ["2 vCPU", "bg-white -rotate-2 shadow-[4px_4px_0_#000]"],
                ["4 Go de RAM", "bg-kraken text-white rotate-[1.5deg] shadow-[4px_4px_0_#000]"],
                ["Port 8080", "bg-ink text-white -rotate-1 shadow-[4px_4px_0_#0047FF]"],
                ["Réseau coupé", "bg-white rotate-2 shadow-[4px_4px_0_#000]"],
              ].map(([t, c]) => (
                <span key={t} data-pop className={cn("rounded-[14px] border-[3px] border-ink px-4 py-2.5 text-[15px] font-extrabold", c)}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="relative min-w-0 flex-[1_1_480px] px-2.5 py-5">
            <Pop lift={-8}>
              <div className="overflow-hidden rounded-[26px] border-4 border-ink bg-ink text-white shadow-[12px_12px_0_#0047FF] [transform:perspective(1100px)_rotateY(-9deg)_rotateX(4deg)_rotateZ(1.5deg)]">
                <div className="flex items-center gap-2 border-b-2 border-graphite px-[18px] py-3.5" aria-hidden="true">
                  <span className="size-3 rounded-full bg-white" />
                  <span className="size-3 rounded-full bg-steel" />
                  <span className="size-3 rounded-full bg-kraken" />
                  <span className="ml-auto">
                    <AnimatedIcon name="terminal" size={18} loop={3000} />
                  </span>
                </div>
                <pre className="overflow-x-auto px-6 pt-[22px] pb-[26px] font-mono text-sm leading-[1.8] whitespace-pre-wrap text-mist sm:text-[15px]">
                  {"$ docker compose up --build\n"}
                  <span className="text-white">api</span>
                  {"        listening on :8080\n"}
                  <span className="text-white">krakenpay</span>
                  {"  listening on :4010\n$ curl localhost:8080/health\n"}
                  <span className="text-white">{'{"status":"ok"}'}</span>
                </pre>
              </div>
            </Pop>
            <Burst size={40} className="-top-3 -right-2.5" />
          </div>
        </Container>
      </section>

      <CtaBand title="Prêt ? Lisez les règles avant de payer quoi que ce soit." href="/regles" label="Règles et barème" />
    </PageMotion>
  );
}
