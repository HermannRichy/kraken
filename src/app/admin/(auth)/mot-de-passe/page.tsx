import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/admin/staff-login";

export const metadata: Metadata = { title: "Définir le mot de passe", robots: { index: false, follow: false } };

async function Form({ searchParams }: { searchParams: PageProps<"/admin/mot-de-passe">["searchParams"] }) {
  const sp = await searchParams;
  return <ResetPasswordForm token={typeof sp.token === "string" ? sp.token : null} />;
}

export default function ResetPage(props: PageProps<"/admin/mot-de-passe">) {
  return (
    <>
      <h2 className="mb-5 text-2xl font-extrabold">Définir votre mot de passe</h2>
      <Suspense fallback={null}>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
