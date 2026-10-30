"use client";

import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { inviteStaffAction, setSeatsCapAction, setStaffRoleAction } from "@/app/admin/actions";
import { SelectField, SubmitButton, TextField } from "@/components/form/fields";
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
      className="grid gap-4 sm:grid-cols-[1fr_1fr_200px_auto] sm:items-end"
    >
      <TextField label="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
      <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <SelectField label="Rôle" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="moderator">Modérateur</option>
        <option value="admin">Administrateur</option>
      </SelectField>
      <SubmitButton pending={pending} className="min-h-[52px]">
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
      <TextField label="Plafond de places" type="number" inputMode="numeric" min={1} max={10000} value={cap} onChange={(e) => setCap(e.target.value)} className="w-48" />
      <SubmitButton pending={pending} className="min-h-[52px]">
        Enregistrer
      </SubmitButton>
    </form>
  );
}

/** Activation de la double authentification (TOTP) avec QR code et codes de secours. */
export function TwoFactorSetup({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [uri, setUri] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [backup, setBackup] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

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
        <TextField label="Mot de passe" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <SubmitButton pending={pending} className="self-start">
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
      <div className="flex flex-wrap gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {qr && <img src={qr} alt="QR code de double authentification" width={220} height={220} className="rounded-xl border-[3px] border-ink" />}
        <div className="grid grid-cols-2 gap-2 self-start font-mono text-sm">
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
          startTransition(async () => {
            const { error } = await authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, "") });
            if (error) {
              toast.error("Code incorrect.");
              return;
            }
            toast.success("Double authentification activée");
            router.push("/admin");
            router.refresh();
          });
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <TextField label="Code à 6 chiffres" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} className="w-48" maxLength={7} />
        <SubmitButton pending={pending} className="min-h-[52px]">
          Valider
        </SubmitButton>
      </form>
    </div>
  );
}
