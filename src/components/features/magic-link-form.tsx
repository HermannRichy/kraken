"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { SubmitButton, TextField } from "@/components/form/fields";
import { authClient } from "@/lib/auth-client";
import { emailField } from "@/lib/validation";

/** Connexion des participants par lien magique (aucun mot de passe). */
export function MagicLinkForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailField.safeParse(email);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message);
    setError(undefined);
    startTransition(async () => {
      const { error: err } = await authClient.signIn.magicLink({
        email: parsed.data,
        callbackURL: "/espace",
        errorCallbackURL: "/connexion?erreur=lien",
      });
      if (err?.status === 429) {
        toast.error("Trop de demandes. Réessayez dans quelques minutes.");
        return;
      }
      // Réponse identique que le compte existe ou non (pas d'énumération des comptes).
      setSent(true);
    });
  };

  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-4 rounded-[26px] border-[3px] border-ink bg-white p-6 shadow-[8px_8px_0_#0047FF]">
        <h2 className="text-2xl font-extrabold">Lien envoyé.</h2>
        <p className="font-semibold">
          Si un compte existe pour <strong className="break-all">{email}</strong>, un lien de connexion vient d&apos;arriver. Il est valable 15 minutes.
        </p>
        <button type="button" onClick={() => setSent(false)} className="self-start text-[15px] font-extrabold underline decoration-kraken decoration-[3px] underline-offset-4">
          Utiliser une autre adresse
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {initialError && (
        <p role="alert" className="rounded-2xl border-[3px] border-ink bg-[#FFE9E9] p-4 font-bold">
          {initialError}
        </p>
      )}
      <TextField
        label="Votre e-mail d'inscription"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        required
      />
      <SubmitButton pending={pending} pendingLabel="Envoi du lien…">
        Recevoir mon lien de connexion
      </SubmitButton>
      <p className="text-sm font-semibold text-steel">
        Pas encore inscrit ?{" "}
        <Link href="/inscription" className="font-extrabold text-ink underline decoration-kraken decoration-[3px] underline-offset-2">
          Prendre ma place
        </Link>
      </p>
    </form>
  );
}
