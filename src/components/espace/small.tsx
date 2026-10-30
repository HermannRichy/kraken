"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { resendVerificationAction } from "@/app/inscription/actions";
import { SubmitButton } from "@/components/form/fields";
import { authClient } from "@/lib/auth-client";

/** Toast de bienvenue après la confirmation d'adresse (?bienvenue=1), puis nettoyage de l'URL. */
export function WelcomeToast() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("bienvenue") === "1") {
      toast.success("Adresse confirmée", { description: "Bienvenue dans votre espace. Dernière étape : le paiement." });
      url.searchParams.delete("bienvenue");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, []);
  return null;
}

export function SignOutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await authClient.signOut();
          toast.success("Vous êtes déconnecté.");
          router.push(redirectTo);
          router.refresh();
        })
      }
      className="inline-flex min-h-11 items-center rounded-[14px] border-[3px] border-ink bg-white px-4 text-sm font-extrabold text-ink shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
    >
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}

export function ResendVerification({ email }: { email: string }) {
  const [pending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);
  return (
    <SubmitButton
      type="button"
      tone="white"
      pending={pending}
      disabled={cooldown > 0}
      onClick={() =>
        startTransition(async () => {
          const res = await resendVerificationAction(email);
          if (res.ok) toast.success("Lien renvoyé", { description: "Consultez votre boîte mail." });
          else toast.error(res.message);
          setCooldown(60);
        })
      }
    >
      {cooldown > 0 ? `Renvoyer (${cooldown} s)` : "Renvoyer le lien de confirmation"}
    </SubmitButton>
  );
}
