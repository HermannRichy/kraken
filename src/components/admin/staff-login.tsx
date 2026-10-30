"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Checkbox, SubmitButton, TextField } from "@/components/form/fields";
import { authClient } from "@/lib/auth-client";
import { emailField } from "@/lib/validation";

/** Connexion de l'équipe : e-mail + mot de passe, puis code de double authentification. */
export function StaffLogin({ startAt2fa = false }: { startAt2fa?: boolean }) {
  const router = useRouter();
  const [step, setStepRaw] = useState<"password" | "totp" | "forgot">(startAt2fa ? "totp" : "password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [trust, setTrust] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const setStep = (next: "password" | "totp" | "forgot") => {
    setError(null);
    setStepRaw(next);
  };

  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailField.safeParse(email).success || password.length < 12) return setError("E-mail ou mot de passe invalide.");
    startTransition(async () => {
      const { data, error: err } = await authClient.signIn.email({ email, password });
      if (err) return setError(err.status === 429 ? "Trop de tentatives. Réessayez dans quelques minutes." : "E-mail ou mot de passe incorrect.");
      if ((data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) return setStep("totp");
      router.push("/admin");
      router.refresh();
    });
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.replace(/\s/g, "");
    if (!useBackup && !/^\d{6}$/.test(clean)) return setError("Le code fait 6 chiffres.");
    startTransition(async () => {
      const { error: err } = useBackup
        ? await authClient.twoFactor.verifyBackupCode({ code: clean, trustDevice: trust })
        : await authClient.twoFactor.verifyTotp({ code: clean, trustDevice: trust });
      if (err) return setError(err.status === 429 ? "Trop de tentatives." : "Code incorrect ou expiré.");
      toast.success("Connexion réussie");
      router.push("/admin");
      router.refresh();
    });
  };

  const forgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailField.safeParse(email).success) return setError("Adresse e-mail invalide.");
    startTransition(async () => {
      await authClient.requestPasswordReset({ email, redirectTo: "/admin/mot-de-passe" });
      toast.success("Si un compte d'équipe existe, un lien vient d'être envoyé.");
      setStep("password");
    });
  };

  const alert = error && (
    <p role="alert" className="rounded-2xl border-[3px] border-ink bg-[#FFE9E9] p-4 font-bold">
      {error}
    </p>
  );

  if (step === "totp")
    return (
      <form onSubmit={verify} noValidate className="flex flex-col gap-5">
        <h2 className="text-2xl font-extrabold">Double authentification</h2>
        {alert}
        <TextField
          label={useBackup ? "Code de secours" : "Code à 6 chiffres"}
          inputMode={useBackup ? "text" : "numeric"}
          autoComplete="one-time-code"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          hint={useBackup ? "Un des codes de secours fournis à l'activation." : "Code affiché dans votre application d'authentification."}
          maxLength={20}
        />
        <Checkbox checked={trust} onChange={(e) => setTrust(e.target.checked)} label="Faire confiance à cet appareil pendant 30 jours" />
        <SubmitButton pending={pending} pendingLabel="Vérification…">
          Valider
        </SubmitButton>
        <button type="button" onClick={() => setUseBackup((b) => !b)} className="self-start text-sm font-extrabold underline underline-offset-4">
          {useBackup ? "Utiliser l'application" : "Utiliser un code de secours"}
        </button>
      </form>
    );

  if (step === "forgot")
    return (
      <form onSubmit={forgot} noValidate className="flex flex-col gap-5">
        <h2 className="text-2xl font-extrabold">Mot de passe oublié</h2>
        {alert}
        <TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <SubmitButton pending={pending}>Recevoir un lien</SubmitButton>
        <button type="button" onClick={() => setStep("password")} className="self-start text-sm font-extrabold underline underline-offset-4">
          Retour
        </button>
      </form>
    );

  return (
    <form onSubmit={signIn} noValidate className="flex flex-col gap-5">
      {alert}
      <TextField label="E-mail" type="email" autoComplete="username" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <TextField label="Mot de passe" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} />
      <SubmitButton pending={pending} tone="black" pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>
      <button type="button" onClick={() => setStep("forgot")} className="self-start text-sm font-extrabold underline underline-offset-4">
        Mot de passe oublié ?
      </button>
    </form>
  );
}

/** Définition du mot de passe (invitation ou réinitialisation). */
export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(token ? null : "Lien invalide ou expiré. Demandez-en un nouveau.");
  const [pending, startTransition] = useTransition();

  const strong = password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!strong) return setError("12 caractères minimum, avec majuscule, minuscule et chiffre.");
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    startTransition(async () => {
      const { error: err } = await authClient.resetPassword({ newPassword: password, token });
      if (err) return setError("Lien invalide ou expiré. Demandez-en un nouveau.");
      toast.success("Mot de passe défini", { description: "Connectez-vous puis activez la double authentification." });
      router.push("/admin/connexion");
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {error && (
        <p role="alert" className="rounded-2xl border-[3px] border-ink bg-[#FFE9E9] p-4 font-bold">
          {error}
        </p>
      )}
      <TextField label="Nouveau mot de passe" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint="12 caractères minimum, avec majuscule, minuscule et chiffre." />
      <TextField label="Confirmation" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <SubmitButton pending={pending} disabled={!token}>
        Définir mon mot de passe
      </SubmitButton>
    </form>
  );
}
