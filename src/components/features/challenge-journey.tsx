import Link from "next/link";

import { Container, H2 } from "@/components/ui/primitives";
import { CHALLENGE, STEPS } from "@/config/challenge";

const JOURNEY = [
  ["Inscription", "Remplissez le formulaire, confirmez votre e-mail, puis réglez les frais d’inscription par Mobile Money. Après validation, votre espace participant rassemble votre statut et vos accès personnels."],
  ["Ouverture", "À l’ouverture du défi, retrouvez les règles, le barème, les contrats OpenAPI et KrakenPay, le prestataire de paiement simulé. Ces paiements de test ne débitent pas votre argent : ils sont distincts des frais d’inscription."],
  ["Développement", "Pendant les 21 jours, construisez et testez votre solution depuis le lieu de votre choix. Vous travaillez seul avec votre ordinateur, Git, Docker et une connexion Internet."],
  ["Livraison", "Avant l’échéance, transmettez à l’organisation un dépôt GitHub accessible et le SHA exact du commit à évaluer. La dernière livraison enregistrée à temps fait foi ; il n’y a plus de modification après la clôture."],
  ["Évaluation", "L’organisation évalue ce commit, publie les résultats, puis ouvre une fenêtre de contestation de 48 heures. Les certificats et leur attribution suivent les conditions publiées par l’organisation."],
] as const;

const FEATURES = [
  ["Le dernier billet", "Deux personnes demandent le dernier billet au même instant : une seule doit réussir."],
  ["Le double clic", "Une même demande de paiement est envoyée deux fois : elle ne doit être débitée qu’une fois."],
  ["Les retards", "Un paiement peut arriver tard, un webhook peut manquer ou être reçu plusieurs fois."],
  ["Les pannes", "Après un arrêt puis un redémarrage, les commandes et les billets doivent conserver un état cohérent."],
] as const;

export function ChallengeJourney() {
  return (
    <section id="deroulement" className="scroll-mt-24 border-b-[3px] border-ink">
      <Container className="flex flex-col gap-12 py-16 lg:py-24">
        <div className="flex max-w-3xl flex-col gap-4">
          <H2>Le déroulement, de l&apos;inscription aux résultats.</H2>
          <p className="text-lg leading-relaxed font-semibold text-steel">
            Kraken est un challenge 100 % en ligne, à distance : aucun déplacement ni lieu physique n&apos;est prévu. Vous construisez le back-end d&apos;une
            billetterie qui résiste aux demandes simultanées, sans vendre deux fois le même billet ni débiter deux fois un paiement.
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Participation", "Une personne, un compte, un dépôt GitHub"],
            ["Frais", `${CHALLENGE.fee} par Mobile Money`],
            ["Places", `${CHALLENGE.seats} maximum`],
            ["Durée", `${CHALLENGE.devDays} jours de développement`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border-[3px] border-ink bg-white p-5">
              <dt className="text-sm font-bold text-steel">{label}</dt>
              <dd className="mt-2 text-lg font-extrabold">{value}</dd>
            </div>
          ))}
        </dl>

        <ol className="grid gap-5 md:grid-cols-2">
          {JOURNEY.map(([title, text], index) => (
            <li key={title} className="rounded-3xl border-[3px] border-ink bg-white p-6 sm:p-7">
              <span className="text-sm font-extrabold text-kraken">ÉTAPE {String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-2xl font-extrabold">{title}</h3>
              <p className="mt-3 leading-relaxed font-semibold text-steel">{text}</p>
            </li>
          ))}
        </ol>

        <div className="grid gap-8 border-y-[3px] border-ink py-10 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-extrabold">Ce que vous développez</h3>
            <p className="mt-3 leading-relaxed font-semibold text-steel">
              Une API pour les comptes, événements, réservations, commandes, paiements, billets, annulations et remboursements. Langage, framework et
              base de données sont libres ; l&apos;usage de l&apos;IA est autorisé à condition de le déclarer dans <code>DECISIONS.md</code>.
            </p>
            <div className="mt-5 grid gap-3">
              {FEATURES.map(([title, text]) => (
                <div key={title} className="rounded-xl border-[3px] border-ink bg-paper p-4">
                  <h4 className="font-extrabold">{title}</h4>
                  <p className="mt-1 text-sm leading-relaxed font-semibold text-steel">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border-[3px] border-ink bg-ink p-6 text-white sm:p-7">
            <h3 className="text-2xl font-extrabold">Ce que fournit l&apos;organisation</h3>
            <p className="mt-3 leading-relaxed font-semibold text-mist">
              La documentation, les contrats OpenAPI, les règles, le barème et KrakenPay. KrakenPay simule les paiements nécessaires au projet
              technique ; les seuls paiements réels concernent les frais d&apos;inscription.
            </p>
            <p className="mt-4 leading-relaxed font-semibold text-mist">
              La documentation est publiée à l&apos;ouverture du défi. Consultez sa page pour le statut des ressources plutôt que de supposer qu&apos;elles
              sont déjà disponibles.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-extrabold">Une livraison reproductible</h3>
            <p className="mt-3 leading-relaxed font-semibold text-steel">
              Votre dépôt doit démarrer avec <code>docker compose up --build</code>, exposer l&apos;API sur le port 8080 et répondre à <code>GET /health</code>.
            </p>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 font-semibold text-steel">
              {["README.md", "docker-compose.yml", ".env.example", "openapi.yaml et errors.yaml", "ARCHITECTURE.md et DECISIONS.md", "tests/"].map((file) => (
                <li key={file}>{file}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold">Comment l&apos;évaluation fonctionne</h3>
            <p className="mt-3 leading-relaxed font-semibold text-steel">
              La justesse passe avant la vitesse. Les portes éliminatoires s&apos;appliquent avant le classement : une survente, un double débit ou une
              livraison non conforme peut exclure du podium.
            </p>
            <p className="mt-3 leading-relaxed font-semibold text-steel">
              Barème sur 100 : fonctionnement et concurrence 30, paiements/idempotence/webhooks 20, performance 20, résilience 10, sécurité 10,
              qualité/tests/documentation 10. La contestation est ouverte pendant 48 heures après les résultats.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border-[3px] border-ink bg-paper p-6 sm:p-8">
          <h3 className="text-2xl font-extrabold">Repères du calendrier</h3>
          <p className="mt-2 font-semibold text-steel">Toutes les heures sont affichées en heure du Bénin (UTC+1). Les dates ci-dessous sont proposées et restent à confirmer par l&apos;organisation.</p>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.slice(0, 4).map((step) => (
              <li key={step.id}>
                <p className="font-extrabold">{step.title}</p>
                <p className="text-sm font-semibold text-steel">{step.when}</p>
              </li>
            ))}
          </ol>
        </div>

        <nav aria-label="Ressources pour participer" className="flex flex-wrap gap-x-6 gap-y-3 font-extrabold underline underline-offset-4">
          <Link href="/calendrier">Calendrier</Link>
          <Link href="/regles">Règles et barème</Link>
          <Link href="/documentation">Documentation</Link>
          <Link href="/prix">Prix et certificats</Link>
          <Link href="/faq">FAQ</Link>
          <a href={CHALLENGE.whatsappUrl} target="_blank" rel="noreferrer">Communauté WhatsApp</a>
          <a href={`mailto:${CHALLENGE.contactEmail}`}>Contacter l&apos;organisation</a>
        </nav>
        <p className="text-sm leading-relaxed font-semibold text-steel">
          Remboursement : possible jusqu&apos;à {CHALLENGE.refundDays} jours après l&apos;inscription. En cas d&apos;annulation faute d&apos;atteindre {CHALLENGE.minParticipants} inscrits,
          les frais sont remboursés automatiquement.
        </p>
      </Container>
    </section>
  );
}
