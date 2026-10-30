import type { Metadata } from "next";

import { PageHero } from "@/components/features/page-hero";
import { AnimatedIcon } from "@/components/motion/animated-icon";
import { Pop } from "@/components/motion/pop";
import { Burst, Squiggle } from "@/components/ui/doodles";
import { Chip, Container, H2, Highlight, IconDot, Sticker } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Dossier du participant, contrats OpenAPI, cahier des charges de KrakenPay et fichiers obligatoires.",
};

const SKINS = [
  { card: "bg-white text-ink shadow-[8px_8px_0_#000]", dot: "black", border: "border-ink text-ink" },
  { card: "bg-kraken text-white shadow-[8px_8px_0_#000]", dot: "black", border: "border-white text-white" },
  { card: "bg-ink text-white shadow-[8px_8px_0_#0047FF]", dot: "white", border: "border-white text-white" },
] as const;
const TILTS = ["distort-a", "distort-b", "distort-c", "distort-d", "distort-e", "distort-f"];

const DOCS = [
  ["Dossier du participant", ".md", "Règles métier, contrat d'API, dictionnaire d'erreurs, conventions et fichiers obligatoires."],
  ["Contrat OpenAPI de la billetterie", ".yaml", "L'API que vous implémentez : chemins, champs, codes HTTP et codes d'erreur."],
  ["Cahier des charges de KrakenPay", ".md", "Scénarios, webhooks signés, persistance et charge du faux prestataire."],
  ["Contrat OpenAPI de KrakenPay", ".yaml", "Le contrat du faux prestataire de paiement, source de vérité."],
  ["Image Docker KrakenPay", ".yml", "docker-compose.krakenpay.yml, image référencée par son digest sha256."],
  ["Guide de notation", ".md", "Portes éliminatoires, barème, procédure d'évaluation et contestations."],
];

const FILES = ["README.md", "docker-compose.yml", ".env.example", "openapi.yaml", "errors.yaml", "ARCHITECTURE.md", "DECISIONS.md", "tests/"];

export default function DocumentationPage() {
  return (
    <>
      <PageHero
        chip={<Chip doodle="star-blue">Documentation</Chip>}
        title={
          <>
            <span data-split>Tout est public. Sauf les </span>
            <Highlight tone="black" doodle={<Burst flip size={40} className="-top-8 -right-11" />}>
              pièges.
            </Highlight>
          </>
        }
        intro="Contrats d'API, règles métier, dictionnaire d'erreurs et comportement du faux prestataire : publiés. Délais exacts, ordre des événements et combinaisons de scénarios de l'évaluation : secrets."
        aside={
          <Pop className="mx-auto w-fit lg:mr-0">
            <div className="flex items-center gap-4 rounded-[28px] border-4 border-ink bg-kraken px-7 py-6 text-white shadow-[10px_10px_0_#000] [transform:perspective(900px)_rotateY(-12deg)_rotateX(5deg)_rotateZ(3deg)]">
              <IconDot tone="black">
                <AnimatedIcon name="lock" size={26} loop={3000} />
              </IconDot>
              <div>
                <div className="text-[13px] font-extrabold tracking-[0.08em]">PUBLICATION</div>
                <div className="text-[26px] font-extrabold tracking-[-0.02em]">10 novembre</div>
              </div>
            </div>
          </Pop>
        }
      />

      <section className="border-b-[3px] border-ink">
        <Container className="flex flex-col gap-11 py-16 lg:py-24">
          <H2>Les documents officiels.</H2>
          <div className="grid grid-cols-1 gap-x-7 gap-y-8 p-1.5 md:grid-cols-2 lg:grid-cols-3">
            {DOCS.map(([title, ext, desc], i) => {
              const skin = SKINS[i % 3];
              return (
                <Pop key={title}>
                  <article className={cn("flex h-full flex-col gap-3.5 rounded-[28px] border-[3px] border-ink p-6", skin.card, TILTS[i])}>
                    <div className="flex items-center justify-between gap-3">
                      <IconDot tone={skin.dot} className="size-[52px] sm:size-[52px]">
                        <AnimatedIcon name="folder-code" size={24} />
                      </IconDot>
                      <span className={cn("rounded-full border-2 px-3 py-1 font-mono text-[13px] font-bold", skin.border)}>{ext}</span>
                    </div>
                    <h3 className="text-[22px] font-extrabold tracking-[-0.02em]">{title}</h3>
                    <p className="text-[15px] leading-normal font-semibold opacity-85">{desc}</p>
                    <span
                      aria-disabled="true"
                      className={cn("mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded-[14px] border-[3px] px-4 text-[15px] font-extrabold", skin.border)}
                    >
                      <AnimatedIcon name="lock" size={18} />
                      Disponible le 10 nov.
                    </span>
                  </article>
                </Pop>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-b-[3px] border-ink bg-ink text-white">
        <Container className="flex flex-wrap items-center gap-14 py-16 lg:py-24">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-[22px]">
            <H2 dark>
              À la racine de votre dépôt.
              <Squiggle color="#0047FF" width={130} className="-bottom-6 left-0" />
            </H2>
            <p data-reveal className="mt-3 text-base leading-relaxed font-semibold text-mist sm:text-lg">
              Vérifiés avant tout test. Un pré-contrôle automatique vous avertit à la livraison, sans jamais bloquer : vous décidez.
            </p>
            <p data-reveal className="text-base leading-relaxed font-semibold text-mist">
              Une question sur le contrat ? Posez-la dans la communauté WhatsApp. Chaque réponse qui précise une règle est ajoutée au dossier,
              avec sa date.
            </p>
          </div>
          <div className="relative min-w-0 flex-[1_1_460px] px-2.5 py-4">
            <Pop lift={-8}>
              <div className="grid grid-cols-1 gap-3 rounded-[28px] border-4 border-white bg-white p-5 text-ink shadow-[12px_12px_0_#0047FF] [transform:perspective(1200px)_rotateY(-8deg)_rotateX(3deg)_rotateZ(1.5deg)] sm:grid-cols-2 sm:p-[26px]">
                {FILES.map((f, i) => (
                  <div key={f} className={cn("flex items-center gap-2.5 rounded-[14px] border-[3px] border-ink p-3", i % 3 === 0 ? "bg-paper" : "bg-white")}>
                    <span className="text-kraken">
                      <AnimatedIcon name="check" size={20} />
                    </span>
                    <span className="font-mono text-[15px] font-bold">{f}</span>
                  </div>
                ))}
              </div>
            </Pop>
            <Sticker variant="torn" tone="blue" className="-top-2.5 -right-1 rotate-[9deg] text-[15px]">
              8
              <br />
              fichiers
            </Sticker>
          </div>
        </Container>
      </section>
    </>
  );
}
