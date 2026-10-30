import type { Metadata } from "next";

import { PageMotion } from "@/components/motion/page-motion";
import { PageHero } from "@/components/features/page-hero";
import { AnimatedIcon } from "@/components/motion/animated-icon";
import { Pop } from "@/components/motion/pop";
import { Burst, Squiggle, Star } from "@/components/ui/doodles";
import { Chip, Container, H2, Highlight, IconDot, Sticker } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Règles et barème",
  description: "Six portes éliminatoires, un barème sur 100, le fair-play et les contestations.",
  path: "/regles",
});

const SKINS = [
  { card: "bg-kraken text-white shadow-[8px_8px_0_#000]", dot: "black" },
  { card: "bg-white text-ink shadow-[8px_8px_0_#000]", dot: "black" },
  { card: "bg-ink text-white shadow-[8px_8px_0_#0047FF]", dot: "white" },
] as const;
const TILTS = ["distort-a", "distort-b", "distort-c", "distort-d", "distort-e", "distort-f"];

const GATES = [
  ["G1", "Aucune survente", "Ventes confirmées ≤ stock, quelle que soit la concurrence.", "1 000 demandes simultanées sur 1 billet, puis sur 50."],
  ["G2", "Aucun double débit", "Une même clé d'idempotence débite une seule fois.", "rejeu, double clic, retries après timeout du faux PSP."],
  ["G3", "Webhooks sûrs", "Signature vérifiée, doublons ignorés, aucun statut qui régresse.", "webhooks forgés, rejoués, dupliqués, dans le désordre."],
  ["G4", "Contrôle d'accès", "Personne ne lit ni n'annule la commande d'un autre ; routes admin protégées.", "attaques d'accès horizontal et vertical."],
  ["G5", "Reprise après panne", "Redémarrage en plein test sans commande perdue ni billet fantôme.", "arrêt brutal de l'API puis de la base pendant la charge."],
  ["G6", "Livraison conforme", "Démarre en une commande, expose /health, respecte le contrat, livré à temps.", "démarrage sur VM propre, tests de contrat."],
];

const CRITERIA = [
  { label: "Correction et concurrence", pts: 30, what: "Contrat d'API, règles métier, codes d'erreur, charge concurrente", bar: "bg-kraken" },
  { label: "Paiements, idempotence, webhooks", pts: 20, what: "Cycle de vie complet, échecs et remboursements du faux PSP", bar: "bg-kraken" },
  { label: "Performance", pts: 20, what: "Quatre profils de charge, 2 vCPU et 4 Go", bar: "bg-ink" },
  { label: "Résilience et reprise", pts: 10, what: "Pannes de la base, du faux PSP, redémarrages", bar: "bg-ink" },
  { label: "Sécurité", pts: 10, what: "Authentification, accès, entrées, secrets, débit", bar: "bg-ink" },
  { label: "Qualité, tests, documentation", pts: 10, what: "README, tests, dictionnaire d'erreurs, lisibilité", bar: "bg-ink" },
];

const PROFILES = [
  ["P1 · Dernier billet", "6 pts"],
  ["P2 · Vente massive", "6 pts"],
  ["P3 · Charge mixte", "4 pts"],
  ["P4 · Faux PSP dégradé", "4 pts"],
];

const FAIR = [
  "Aucun nom de scénario de test KrakenPay écrit en dur pour un comportement spécial.",
  "Aucun code qui détecte l'environnement d'évaluation pour se comporter autrement.",
  "Aucune modification, contournement ou remplacement de KrakenPay.",
  "Aucune tentative d'accès au banc de test, aux autres soumissions ou à l'infrastructure.",
  "Pas de partage de code avant les résultats : deux solutions identiques sont disqualifiées.",
  "Aucune dépendance qui appelle un service externe : le réseau est coupé, hors KrakenPay.",
];

export default function ReglesPage() {
  return (
    <PageMotion>
      <PageHero
        tone="black"
        chip={
          <Chip dark doodle="star">
            02 · Règles et barème
          </Chip>
        }
        title={
          <>
            <span data-split>Une vente en trop, et c&apos;est </span>
            <Highlight tone="blue-dark" doodle={<Burst flip color="#fff" size={40} className="-top-8 -right-11" />}>
              fini.
            </Highlight>
          </>
        }
        intro="Une solution qui vend deux fois le dernier billet ne gagne jamais, même si elle est la plus rapide. Chaque note vient d'un test automatique rejouable sur une machine jetable."
        aside={
          <div className="relative mx-auto w-fit p-4 lg:mr-0">
            <Pop>
              <div className="rounded-[28px] border-4 border-white bg-white px-8 py-6 text-center text-ink shadow-[10px_10px_0_#0047FF] [transform:perspective(900px)_rotateY(-12deg)_rotateX(5deg)_rotateZ(3deg)]">
                <div className="text-[13px] font-extrabold tracking-[0.1em] text-steel">NOTE MAXIMALE</div>
                <div className="text-8xl leading-none font-extrabold tracking-[-0.05em]">100</div>
              </div>
            </Pop>
            <Sticker variant="torn" tone="blue" className="-bottom-2.5 -left-4 -rotate-[9deg] text-[15px]">
              Justesse
              <br />
              d&apos;abord
            </Sticker>
          </div>
        }
      />

      {/* Portes */}
      <section className="border-b-[3px] border-ink">
        <Container className="flex flex-col gap-12 py-16 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <H2 className="max-w-[720px]">Six portes éliminatoires.</H2>
            <p data-reveal className="max-w-[480px] flex-[1_1_340px] text-base leading-relaxed font-semibold text-steel sm:text-[17px]">
              Échouer à une seule exclut du podium. Vous gardez votre certificat de participation si le projet livré démarre.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-x-7 gap-y-8 p-1.5 md:grid-cols-2 lg:grid-cols-3">
            {GATES.map(([id, title, rule, test], i) => {
              const skin = SKINS[i % 3];
              return (
                <Pop key={id}>
                  <article className={cn("flex h-full flex-col gap-3 rounded-[28px] border-[3px] border-ink p-[26px]", skin.card, TILTS[i])}>
                    <div className="flex items-center gap-3.5">
                      <IconDot tone={skin.dot} className="size-[54px] text-lg font-extrabold sm:size-[54px]">
                        {id}
                      </IconDot>
                      <h3 className="text-[23px] font-extrabold tracking-[-0.02em]">{title}</h3>
                    </div>
                    <p className="text-base leading-normal font-bold">{rule}</p>
                    <p className="text-sm leading-normal font-semibold opacity-80">Test : {test}</p>
                  </article>
                </Pop>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Barème */}
      <section className="border-b-[3px] border-ink bg-paper">
        <Container className="flex flex-wrap gap-14 py-16 lg:py-24">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-[22px]">
            <H2>
              Le barème sur 100.
              <Squiggle color="#0047FF" width={130} className="-bottom-6 left-0" />
            </H2>
            <p data-reveal className="mt-3 text-base leading-relaxed font-semibold text-steel sm:text-lg">
              La correction sous concurrence et les paiements valent 50 points à eux deux. La performance pèse 20 points, mesurée sur quatre
              profils avec le même budget de ressources pour tout le monde.
            </p>
            <Pop lift={-8}>
              <div className="flex flex-col gap-3.5 rounded-[26px] border-[3px] border-ink bg-white p-6 shadow-[8px_8px_0_#000] [transform:perspective(1000px)_rotateY(7deg)_rotateZ(-1deg)]">
                <div className="flex items-center gap-2.5 text-sm font-extrabold tracking-[0.08em] text-steel">
                  <AnimatedIcon name="zap" size={20} />
                  PROFILS DE PERFORMANCE
                </div>
                {PROFILES.map(([p, pts]) => (
                  <div key={p} className="flex justify-between gap-3 text-base font-bold">
                    <span>{p}</span>
                    <span className="font-extrabold">{pts}</span>
                  </div>
                ))}
                <p className="mt-1 text-sm leading-normal font-semibold text-steel">
                  Points par paliers par rapport à l&apos;implémentation de référence : de 100 % (≥ 1,5×) à 0 (sous 0,25×).
                </p>
              </div>
            </Pop>
          </div>
          <div className="relative min-w-0 flex-[1_1_520px] p-2.5">
            <Pop lift={-8} scale={1.02}>
              <div className="flex flex-col gap-[18px] rounded-[32px] border-4 border-ink bg-white p-6 shadow-[12px_12px_0_#0047FF] [transform:perspective(1400px)_rotateY(-8deg)_rotateX(3deg)_rotateZ(1.5deg)] sm:p-8">
                {CRITERIA.map((c) => (
                  <div key={c.label}>
                    <div className="mb-1 flex justify-between gap-3 text-[17px] font-extrabold">
                      <span>{c.label}</span>
                      <span>{c.pts}</span>
                    </div>
                    <div className="mb-2 text-sm font-semibold text-steel">{c.what}</div>
                    <div className="h-4 overflow-hidden rounded-full border-[3px] border-ink">
                      <div data-fill className={cn("h-full", c.bar)} style={{ width: `${(c.pts / 30) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Pop>
            <Burst flip size={40} className="-top-5 -right-1.5" />
          </div>
        </Container>
      </section>

      {/* Fair-play */}
      <section className="border-b-[3px] border-ink">
        <Container className="flex flex-wrap gap-14 py-16 lg:py-24">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-[26px]">
            <H2>Fair-play. Sinon dehors.</H2>
            <div className="flex flex-col gap-3.5">
              {FAIR.map((f, i) => (
                <div
                  key={f}
                  data-reveal
                  className={cn(
                    "flex items-start gap-3.5 rounded-[18px] border-[3px] border-ink bg-white px-[18px] py-4",
                    i % 2 ? "rotate-[0.5deg]" : "-rotate-[0.6deg]",
                  )}
                >
                  <span className="flex size-[30px] flex-none items-center justify-center rounded-full bg-ink text-white">
                    <AnimatedIcon name="x" size={16} />
                  </span>
                  <span className="text-base leading-normal font-bold">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-8 pt-2">
            <Pop>
              <div className="flex flex-col gap-3 rounded-[28px] border-[3px] border-ink bg-kraken p-7 text-white shadow-[8px_8px_0_#000] distort-e">
                <div className="flex items-center gap-3">
                  <AnimatedIcon name="sparkles" size={26} />
                  <h3 className="text-2xl font-extrabold">Outils d&apos;IA autorisés</h3>
                </div>
                <p className="text-base leading-normal font-semibold">
                  À déclarer dans <code className="font-mono">DECISIONS.md</code> : quels outils, pour quelles parties du code. Vous restez
                  responsable de ce que vous livrez.
                </p>
              </div>
              <Star size={34} className="-top-6 right-3.5" />
            </Pop>
            <Pop>
              <div className="flex flex-col gap-3 rounded-[28px] border-[3px] border-ink bg-white p-7 shadow-[8px_8px_0_#000] distort-b">
                <h3 className="text-2xl font-extrabold">Départage</h3>
                <ol className="list-inside list-decimal text-base leading-relaxed font-semibold text-steel">
                  <li>Plus de points de correction fonctionnelle</li>
                  <li>Meilleur score au profil P1</li>
                  <li>Date de dépôt la plus ancienne</li>
                </ol>
              </div>
            </Pop>
            <Pop>
              <div className="flex flex-col gap-3 rounded-[28px] border-[3px] border-ink bg-ink p-7 text-white shadow-[8px_8px_0_#0047FF] distort-c">
                <div className="flex items-center gap-3">
                  <AnimatedIcon name="shield-check" size={26} />
                  <h3 className="text-2xl font-extrabold">Contestations</h3>
                </div>
                <p className="text-base leading-normal font-semibold text-mist">
                  48 h après la publication des résultats, avec une reproduction du problème. Décision finale et motivée de l&apos;organisation.
                </p>
              </div>
            </Pop>
          </div>
        </Container>
      </section>
    </PageMotion>
  );
}
