import type { Metadata } from "next";
import { Suspense } from "react";

import { MagicLinkForm } from "@/components/features/magic-link-form";
import { PageMotion } from "@/components/motion/page-motion";
import { Burst } from "@/components/ui/doodles";
import { Chip, Container, Highlight } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connexion à votre espace participant Kraken, édition 01 — thème Sold Out.",
  robots: { index: false },
};

const ERRORS: Record<string, string> = {
  lien: "Ce lien n'est plus valable (expiré ou déjà utilisé). Demandez-en un nouveau.",
  INVALID_TOKEN: "Ce lien n'est plus valable. Demandez-en un nouveau.",
  EXPIRED_TOKEN: "Ce lien a expiré. Demandez-en un nouveau.",
};

async function Form({ searchParams }: { searchParams: PageProps<"/connexion">["searchParams"] }) {
  const sp = await searchParams;
  const code = typeof sp.erreur === "string" ? sp.erreur : typeof sp.error === "string" ? sp.error : undefined;
  return <MagicLinkForm initialError={code ? (ERRORS[code] ?? ERRORS.lien) : undefined} />;
}

export default function ConnexionPage(props: PageProps<"/connexion">) {
  return (
    <PageMotion>
      <section className="border-b-[3px] border-ink bg-paper">
        <Container className="flex flex-wrap items-start gap-12 py-14 lg:py-20">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
            <Chip doodle="star-blue">Espace participant</Chip>
            <h1 className="text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[72px] lg:leading-none">
              <span data-split>Content de vous </span>
              <Highlight doodle={<Burst flip size={40} className="-top-8 -right-11" />}>revoir.</Highlight>
            </h1>
            <p data-reveal className="max-w-[520px] text-[17px] leading-normal font-semibold sm:text-xl">
              Pas de mot de passe : entrez votre e-mail, on vous envoie un lien de connexion à usage unique.
            </p>
          </div>
          <div className="w-full max-w-[520px] flex-[1_1_380px] rounded-[30px] border-4 border-ink bg-white p-6 shadow-[10px_10px_0_#000] sm:p-8">
            <Suspense fallback={<MagicLinkForm />}>
              <Form searchParams={props.searchParams} />
            </Suspense>
          </div>
        </Container>
      </section>
    </PageMotion>
  );
}
