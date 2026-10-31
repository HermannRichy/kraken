"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Checkbox, Honeypot, OtpInput, PasswordField, SubmitButton, TextField } from "@/components/form/fields";
import { CAPTCHA_WAIT, Turnstile, useCaptcha } from "@/components/form/turnstile";
import { authClient } from "@/lib/auth-client";
import { emailField } from "@/lib/validation";

type Step = "password" | "totp" | "forgot";

/** En-têtes anti-robot transmis à better-auth (pot de miel + jeton Turnstile). */
const botHeaders = (hp: string, token: string | null) => ({ ...(hp ? { "x-kraken-hp": hp } : {}), ...(token ? { "x-captcha-response": token } : {}) });

/** Connexion de l'équipe : e-mail + mot de passe, puis code de double authentification. */
export function StaffLogin({ startAt2fa = false, resetPath }: { startAt2fa?: boolean; resetPath: string }) {
  const router = useRouter();
  const [step, setStepRaw] = useState<Step>(startAt2fa ? "totp" : "password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [trust, setTrust] = useState(false);
  const [hp, setHp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const captcha = useCaptcha();
  const submitting = useRef(false);

  const setStep = (next: Step) => {
    setError(null);
    setCode("");
    setStepRaw(next);
  };

  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailField.safeParse(email).success || password.length < 12) return setError("E-mail ou mot de passe invalide.");
    if (!captcha.ready) return setError(CAPTCHA_WAIT);
    startTransition(async () => {
      const { data, error: err } = await authClient.signIn.email({ email, password }, { headers: botHeaders(hp, captcha.token) });
      captcha.reset();
      if (err) {
        setPassword("");
        return setError(err.status === 429 ? "Trop de tentatives. Réessayez dans quelques minutes." : err.status === 403 || err.status === 400 ? "Vérification anti-robot échouée. Réessayez." : "E-mail ou mot de passe incorrect.");
      }
      if ((data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) return setStep("totp");
      router.push("/admin");
      router.refresh();
    });
  };

  const verify = (value: string) => {
    const clean = value.replace(/\s/g, "");
    if (!useBackup && !/^\d{6}$/.test(clean)) return setError("Le code fait 6 chiffres.");
    if (useBackup && clean.length < 6) return setError("Code de secours invalide.");
    if (submitting.current) return;
    submitting.current = true;
    setError(null);
    startTransition(async () => {
      const { error: err } = useBackup
        ? await authClient.twoFactor.verifyBackupCode({ code: clean, trustDevice: trust })
        : await authClient.twoFactor.verifyTotp({ code: clean, trustDevice: trust });
      submitting.current = false;
      if (err) {
        setCode("");
        return setError(err.status === 429 ? "Trop de tentatives. Patientez quelques minutes." : "Code incorrect ou expiré.");
      }
      toast.success("Connexion réussie");
      router.push("/admin");
      router.refresh();
    });
  };

  const forgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailField.safeParse(email).success) return setError("Adresse e-mail invalide.");
    if (!captcha.ready) return setError(CAPTCHA_WAIT);
    startTransition(async () => {
      if (!hp) await authClient.requestPasswordReset({ email, redirectTo: resetPath }, { headers: botHeaders(hp, captcha.token) });
      captcha.reset();
      toast.success("Si un compte d'équipe existe, un lien vient d'être envoyé.");
      setStep("password");
    });
  };

  const alert = error && (
    <p role="alert" className="rounded-2xl border-[3px] border-ink bg-[#FFE9E9] p-4 text-[15px] font-bold">
      {error}
    </p>
  );

  if (step === "totp")
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
        noValidate
        className="flex flex-col gap-5"
      >
        <div>
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Double authentification</h2>
          <p className="mt-1 text-[15px] font-semibold text-steel">{useBackup ? "Saisissez un de vos codes de secours." : "Ouvrez votre application d'authentification."}</p>
        </div>
        {alert}
        {useBackup ? (
          <TextField label="Code de secours" autoComplete="off" autoCapitalize="none" spellCheck={false} autoFocus value={code} onChange={(e) => setCode(e.target.value)} maxLength={24} />
        ) : (
          <OtpInput value={code} onChange={setCode} onComplete={verify} disabled={pending} autoFocus hint="Le code change toutes les 30 secondes." />
        )}
        <Checkbox checked={trust} onChange={(e) => setTrust(e.target.checked)} label="Faire confiance à cet appareil pendant 30 jours" />
        <SubmitButton pending={pending} tone="black" pendingLabel="Vérification…" className="w-full">
          Valider
        </SubmitButton>
        <button
          type="button"
          onClick={() => {
            setUseBackup((b) => !b);
            setCode("");
            setError(null);
          }}
          className="self-start text-sm font-extrabold underline underline-offset-4"
        >
          {useBackup ? "Utiliser l'application" : "Utiliser un code de secours"}
        </button>
      </form>
    );

  if (step === "forgot")
    return (
      <form onSubmit={forgot} noValidate className="flex flex-col gap-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Mot de passe oublié</h2>
          <p className="mt-1 text-[15px] font-semibold text-steel">Un lien valable 1 heure vous sera envoyé.</p>
        </div>
        {alert}
        <Honeypot value={hp} onChange={setHp} />
        <TextField label="E-mail" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Turnstile nonce={captcha.nonce} action="admin_reset" onToken={captcha.setToken} />
        <SubmitButton pending={pending} tone="black" className="w-full">
          Recevoir un lien
        </SubmitButton>
        <button type="button" onClick={() => setStep("password")} className="self-start text-sm font-extrabold underline underline-offset-4">
          ← Retour
        </button>
      </form>
    );

  return (
    <form onSubmit={signIn} noValidate className="flex flex-col gap-5">
      <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Connexion</h2>
      {alert}
      <Honeypot value={hp} onChange={setHp} />
      <TextField label="E-mail" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} required />
      <PasswordField label="Mot de passe" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} />
      <Turnstile nonce={captcha.nonce} action="admin_login" onToken={captcha.setToken} />
      <SubmitButton pending={pending} tone="black" pendingLabel="Connexion…" className="w-full">
        Se connecter
      </SubmitButton>
      <button type="button" onClick={() => setStep("forgot")} className="self-start text-sm font-extrabold underline underline-offset-4">
        Mot de passe oublié ?
      </button>
    </form>
  );
}

/** Définition du mot de passe (invitation ou réinitialisation). */
export function ResetPasswordForm({ token, loginPath }: { token: string | null; loginPath: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(token ? null : "Lien invalide ou expiré. Demandez-en un nouveau.");
  const [pending, startTransition] = useTransition();

  const rules = [
    { ok: password.length >= 12, label: "12 caractères" },
    { ok: /[a-z]/.test(password) && /[A-Z]/.test(password), label: "Majuscule et minuscule" },
    { ok: /\d/.test(password), label: "Un chiffre" },
  ];
  const strong = rules.every((r) => r.ok);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!strong) return setError("12 caractères minimum, avec majuscule, minuscule et chiffre.");
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    startTransition(async () => {
      const { error: err } = await authClient.resetPassword({ newPassword: password, token });
      if (err) return setError("Lien invalide ou expiré. Demandez-en un nouveau.");
      toast.success("Mot de passe défini", { description: "Connectez-vous puis activez la double authentification." });
      router.push(loginPath);
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {error && (
        <p role="alert" className="rounded-2xl border-[3px] border-ink bg-[#FFE9E9] p-4 text-[15px] font-bold">
          {error}
        </p>
      )}
      <PasswordField label="Nouveau mot de passe" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <ul className="flex flex-wrap gap-2" aria-label="Exigences du mot de passe">
        {rules.map((r) => (
          <li key={r.label} className={`rounded-full border-2 border-ink px-3 py-1 text-[13px] font-bold ${r.ok ? "bg-kraken text-white" : "bg-white"}`}>
            {r.ok ? "✓ " : ""}
            {r.label}
          </li>
        ))}
      </ul>
      <PasswordField
        label="Confirmation"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={confirm && confirm !== password ? "Les deux mots de passe ne correspondent pas." : undefined}
      />
      <SubmitButton pending={pending} disabled={!token} tone="black" className="w-full">
        Définir mon mot de passe
      </SubmitButton>
    </form>
  );
}
