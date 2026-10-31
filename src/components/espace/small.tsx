"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { resendVerificationAction } from "@/app/inscription/actions";
import { SubmitButton } from "@/components/form/fields";

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
