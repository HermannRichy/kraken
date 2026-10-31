"use client";

import QRCode from "qrcode";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { inviteStaffAction, setSeatsCapAction, setStaffRoleAction } from "@/app/admin/actions";
import { OtpInput, PasswordField, SelectField, SubmitButton, TextField } from "@/components/form/fields";
import { authClient } from "@/lib/auth-client";

export function InviteStaffForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("moderator");
  const [pending, startTransition] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await inviteStaffAction({ name, email, role });
          if (res.ok) {
            toast.success(res.message ?? "Invitation envoyée");
            setName("");
            setEmail("");
          } else toast.error(res.error);
        });
      }}
      className="grid gap-4 md:grid-cols-2 md:items-end 2xl:grid-cols-[1fr_1fr_200px_auto]"
    >
      <TextField label="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
      <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <SelectField label="Rôle" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="moderator">Modérateur</option>
        <option value="admin">Administrateur</option>
      </SelectField>
      <SubmitButton pending={pending} className="min-h-[52px] w-full 2xl:w-auto">
        Inviter
      </SubmitButton>
    </form>
  );
}

export function StaffRoleSelect({ userId, role, self }: { userId: string; role: string; self: boolean }) {
  const [pending, startTransition] = useTransition();
  if (self) return <span className="text-sm font-bold text-steel">Vous</span>;
  return (
    <select
      aria-label="Rôle"
      disabled={pending}
      defaultValue={role}
      onChange={(e) => {
        const value = e.target.value as "admin" | "moderator" | "none";
        if (value === "none" && !window.confirm("Retirer l'accès à l'administration ?")) {
          e.target.value = role;
          return;
        }
        startTransition(async () => {
          const res = await setStaffRoleAction(userId, value);
          if (res.ok) toast.success(res.message ?? "Mis à jour");
          else {
            toast.error(res.error);
            e.target.value = role;
          }
        });
      }}
      className="min-h-10 rounded-[12px] border-[3px] border-ink bg-white px-2 text-sm font-bold"
    >
      <option value="moderator">Modérateur</option>
      <option value="admin">Administrateur</option>
      <option value="none">Retirer l&apos;accès</option>
    </select>
  );
}

export function SeatsCapForm({ value }: { value: number }) {
  const [cap, setCap] = useState(String(value));
  const [pending, startTransition] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await setSeatsCapAction(Number(cap));
          if (res.ok) toast.success(res.message ?? "Enregistré");
          else toast.error(res.error);
        });
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <TextField label="Plafond de places" type="number" inputMode="numeric" min={1} max={10000} value={cap} onChange={(e) => setCap(e.target.value)} className="w-full sm:w-48" />
      <SubmitButton pending={pending} className="min-h-[52px] w-full sm:w-auto">
        Enregistrer
      </SubmitButton>
    </form>
  );
}

/** Activation de la double authentification (TOTP) avec QR code et codes de secours. */
export function TwoFactorSetup({ enabled }: { enabled: boolean }) {
  const [password, setPassword] = useState("");
  const [uri, setUri] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [backup, setBackup] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  const confirm = (value: string) => {
    if (!/^\d{6}$/.test(value) || pending) return;
    startTransition(async () => {
      const { error } = await authClient.twoFactor.verifyTotp({ code: value });
      if (error) {
        setCode("");
        toast.error("Code incorrect.");
        return;
      }
      toast.success("Double authentification activée");
      // Rechargement complet : la session porte désormais la 2FA.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- rechargement voulu (nouvel état de session)
      window.setTimeout(() => window.location.assign("/admin"), 600);
    });
  };

  useEffect(() => {
    if (!uri) return;
    QRCode.toDataURL(uri, { margin: 1, width: 220, color: { dark: "#000000", light: "#ffffff" } }).then(setQr).catch(() => setQr(null));
  }, [uri]);

  if (enabled)
    return (
      <div className="flex flex-col gap-3">
        <p className="font-bold">✓ La double authentification est active sur votre compte.</p>
        <p className="text-sm text-steel">En cas de perte de votre téléphone, utilisez un code de secours, puis demandez à un administrateur de réinitialiser l&apos;accès.</p>
      </div>
    );

  if (!uri)
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const { data, error } = await authClient.twoFactor.enable({ password });
            if (error || !data || data.method !== "totp") {
              toast.error("Mot de passe incorrect.");
              return;
            }
            setUri(data.totpURI);
            setBackup(data.backupCodes);
          });
        }}
        className="flex flex-col gap-4"
      >
        <p className="font-semibold">Obligatoire pour accéder à l&apos;administration. Confirmez votre mot de passe pour commencer.</p>
        <PasswordField label="Mot de passe" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="max-w-[420px]" />
        <SubmitButton pending={pending} className="w-full sm:w-auto sm:self-start">
          Activer la double authentification
        </SubmitButton>
      </form>
    );

  return (
    <div className="flex flex-col gap-5">
      <ol className="flex list-inside list-decimal flex-col gap-2 font-semibold">
        <li>Scannez ce QR code avec Google Authenticator, 1Password, Authy…</li>
        <li>Notez les codes de secours dans un endroit sûr.</li>
        <li>Saisissez le code à 6 chiffres affiché pour valider.</li>
      </ol>
      <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {qr && <img src={qr} alt="QR code de double authentification" width={220} height={220} className="size-[220px] self-center rounded-xl border-[3px] border-ink sm:self-start" />}
        <div className="grid grid-cols-2 gap-2 self-stretch font-mono text-sm sm:self-start">
          {backup.map((c) => (
            <code key={c} className="rounded-lg border-2 border-ink bg-paper px-2 py-1">
              {c}
            </code>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          confirm(code);
        }}
        className="flex flex-col gap-4"
      >
        <OtpInput value={code} onChange={setCode} onComplete={confirm} disabled={pending} hint="Le code affiché par l'application pour « Kraken by HustlerLabs »." />
        <SubmitButton pending={pending} tone="black" className="w-full sm:w-auto sm:self-start">
          Valider
        </SubmitButton>
      </form>
    </div>
  );
}
