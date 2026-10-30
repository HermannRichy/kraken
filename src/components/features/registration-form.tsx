"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { registerAction, resendVerificationAction } from "@/app/inscription/actions";
import { Checkbox, SelectField, Spinner, SubmitButton, TextField } from "@/components/form/fields";
import { FEATURED_COUNTRIES, OTHER_COUNTRIES } from "@/config/countries";
import { fieldErrors, LEVELS, REFERRALS, registrationSchema, type RegistrationInput } from "@/lib/validation";
import { cn } from "@/lib/utils";

type Values = Omit<RegistrationInput, "acceptRules" | "acceptTerms" | "acceptData"> & {
  acceptRules: boolean;
  acceptTerms: boolean;
  acceptData: boolean;
};

const initial = (): Values => ({
  fullName: "",
  email: "",
  phoneCountry: "BJ",
  phone: "",
  country: "BJ",
  city: "",
  github: "",
  level: "" as Values["level"],
  language: "",
  referral: "",
  acceptRules: false,
  acceptTerms: false,
  acceptData: false,
  publicName: false,
  website: "",
  startedAt: 0,
});

const SECTIONS = [
  { n: "01", title: "Vous", fields: ["fullName", "country", "city"] },
  { n: "02", title: "Pour vous joindre", fields: ["email", "phone"] },
  { n: "03", title: "Votre profil de dev", fields: ["github", "level", "language", "referral"] },
  { n: "04", title: "Vos engagements", fields: ["acceptRules", "acceptTerms", "acceptData"] },
];

const LABELS: Record<string, string> = {
  fullName: "Nom complet",
  email: "E-mail",
  phone: "Téléphone",
  country: "Pays",
  city: "Ville",
  github: "Identifiant GitHub",
  level: "Niveau",
  acceptRules: "Règles et fair-play",
  acceptTerms: "Conditions de participation",
  acceptData: "Traitement des données",
};

function CountryOptions({ withDial = false }: { withDial?: boolean }) {
  return (
    <>
      <optgroup label="Les plus fréquents">
        {FEATURED_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {withDial ? `+${c.dial}` : c.name}
            {withDial ? ` ${c.name}` : ""}
          </option>
        ))}
      </optgroup>
      <optgroup label="Tous les pays">
        {OTHER_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {withDial ? `+${c.dial} ${c.name}` : c.name}
          </option>
        ))}
      </optgroup>
    </>
  );
}

type GhState = "idle" | "checking" | "ok" | "missing" | "invalid";

export function RegistrationForm() {
  const [values, setValues] = useState<Values>(initial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [ghResult, setGhResult] = useState<{ login: string; exists: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);
  // Heure de première saisie (anti-robot), fixée au premier événement utilisateur.
  const startedAt = useRef(0);

  // Validation locale (mêmes règles que le serveur)
  const clientErrors = useMemo(() => {
    const parsed = registrationSchema.safeParse({ ...values, startedAt: 1 });
    return parsed.success ? {} : fieldErrors(parsed.error);
  }, [values]);

  const errorFor = (field: string) => serverErrors[field] ?? (touched[field] ? clientErrors[field] : undefined);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    if (!startedAt.current) startedAt.current = Date.now();
    setValues((v) => ({ ...v, [key]: value }));
    if (serverErrors[key as string]) {
      setServerErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };
  const touch = (key: string) => setTouched((t) => ({ ...t, [key]: true }));

  // Vérification GitHub en direct (état dérivé de la saisie + résultat de la dernière requête)
  const ghLogin = values.github.trim().replace(/^@/, "");
  const ghValid = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(ghLogin);
  const gh: GhState = !ghLogin ? "idle" : !ghValid ? "invalid" : ghResult?.login === ghLogin ? (ghResult.exists ? "ok" : "missing") : "checking";

  useEffect(() => {
    if (!ghLogin || !ghValid) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/github/${encodeURIComponent(ghLogin)}`, { signal: ctrl.signal });
        if (!res.ok) return setGhResult({ login: ghLogin, exists: true });
        const json = (await res.json()) as { exists: boolean };
        setGhResult({ login: ghLogin, exists: json.exists });
      } catch {
        /* requête annulée */
      }
    }, 600);
    return () => {
      window.clearTimeout(t);
      ctrl.abort();
    };
  }, [ghLogin, ghValid]);

  const progress = SECTIONS.map((s) => s.fields.filter((f) => !["language", "referral"].includes(f)).every((f) => !clientErrors[f] && (values as Record<string, unknown>)[f] !== "" && (values as Record<string, unknown>)[f] !== false));
  const doneCount = progress.filter(Boolean).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = Object.fromEntries(Object.keys(values).map((k) => [k, true]));
    setTouched(all);
    const local = registrationSchema.safeParse({ ...values, startedAt: startedAt.current || Date.now() });
    if (!local.success) {
      setFormMessage("Quelques champs sont à corriger avant d'envoyer.");
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (gh === "missing") {
      setServerErrors({ github: "Aucun compte GitHub ne correspond à cet identifiant." });
      return;
    }
    setFormMessage(null);
    startTransition(async () => {
      const res = await registerAction({ ...values, acceptRules: true, acceptTerms: true, acceptData: true, startedAt: startedAt.current || Date.now() } as RegistrationInput);
      if (res.ok) {
        setDone(res.email);
        toast.success("Inscription enregistrée", { description: "Confirmez votre adresse pour continuer." });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setServerErrors(res.errors ?? {});
        setFormMessage(res.message);
        toast.error(res.message);
        window.requestAnimationFrame(() => summaryRef.current?.focus());
      }
    });
  };

  if (done) return <CheckInbox email={done} />;

  const visibleErrors = Object.keys(LABELS).filter((k) => errorFor(k));

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      {/* Progression */}
      <div className="flex items-center gap-3" aria-hidden="true">
        {SECTIONS.map((s, i) => (
          <div key={s.n} className={cn("h-3 flex-1 rounded-full border-[3px] border-ink transition-colors", progress[i] ? "bg-kraken" : "bg-white")} />
        ))}
        <span className="text-sm font-extrabold whitespace-nowrap">{doneCount}/4</span>
      </div>

      {formMessage && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-[20px] border-[3px] border-ink bg-[#FFE9E9] p-5 shadow-[5px_5px_0_#C62828] outline-none">
          <p className="font-extrabold">{formMessage}</p>
          {visibleErrors.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {visibleErrors.map((k) => (
                <li key={k} className="rounded-full border-2 border-ink bg-white px-3 py-1 text-[13px] font-bold">
                  {LABELS[k]}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Piège anti-robot (invisible) */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Site web
          <input tabIndex={-1} autoComplete="off" value={values.website ?? ""} onChange={(e) => set("website", e.target.value)} />
        </label>
      </div>

      <Section n="01" title="Vous">
        <TextField
          label="Nom complet"
          hint="Tel qu'il apparaîtra sur votre certificat."
          autoComplete="name"
          value={values.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          onBlur={() => touch("fullName")}
          error={errorFor("fullName")}
          maxLength={80}
          required
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField label="Pays" autoComplete="country" value={values.country} onChange={(e) => set("country", e.target.value)} onBlur={() => touch("country")} error={errorFor("country")}>
            <CountryOptions />
          </SelectField>
          <TextField label="Ville" autoComplete="address-level2" value={values.city} onChange={(e) => set("city", e.target.value)} onBlur={() => touch("city")} error={errorFor("city")} maxLength={80} required />
        </div>
      </Section>

      <Section n="02" title="Pour vous joindre">
        <TextField
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          hint="Un lien de confirmation vous sera envoyé avant le paiement."
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          onBlur={() => touch("email")}
          error={errorFor("email")}
          maxLength={254}
          required
        />
        <TextField
          label="Téléphone (WhatsApp)"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={values.phoneCountry === "BJ" ? "01 53 10 95 25" : "Numéro"}
          hint="Joignable sur WhatsApp, le canal officiel du défi."
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          onBlur={() => touch("phone")}
          error={errorFor("phone")}
          maxLength={20}
          required
          addon={
            <select
              aria-label="Indicatif"
              autoComplete="tel-country-code"
              value={values.phoneCountry}
              onChange={(e) => set("phoneCountry", e.target.value)}
              className="min-h-[52px] w-[118px] flex-none appearance-none rounded-[14px] border-[3px] border-ink bg-paper px-3 text-base font-extrabold outline-none focus:shadow-[4px_4px_0_#0047FF]"
            >
              <CountryOptions withDial />
            </select>
          }
        />
      </Section>

      <Section n="03" title="Votre profil de dev">
        <TextField
          label="Identifiant GitHub"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="votre-identifiant"
          hint="Le dépôt livré devra appartenir à ce compte."
          value={values.github}
          onChange={(e) => set("github", e.target.value)}
          onBlur={() => touch("github")}
          error={errorFor("github") ?? (gh === "missing" ? "Aucun compte GitHub ne correspond à cet identifiant." : undefined)}
          maxLength={40}
          required
          status={<GithubStatus state={gh} />}
          addon={<span className="flex min-h-[52px] items-center rounded-[14px] border-[3px] border-ink bg-paper px-3.5 font-mono text-sm font-bold">github.com/</span>}
        />
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2 text-[15px] font-extrabold">Niveau d&apos;expérience</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LEVELS.map((l, i) => (
              <label
                key={l.value}
                className={cn(
                  "flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-[3px] border-ink px-3 text-center text-[15px] font-extrabold transition-[background-color,box-shadow,transform] has-[:focus-visible]:shadow-[4px_4px_0_#0047FF]",
                  values.level === l.value ? "bg-ink text-white shadow-[4px_4px_0_#0047FF]" : "bg-white shadow-[4px_4px_0_#000] hover:-translate-y-0.5",
                  i % 2 ? "rotate-[0.8deg]" : "-rotate-[0.8deg]",
                )}
              >
                <input type="radio" name="level" value={l.value} checked={values.level === l.value} onChange={() => set("level", l.value)} onBlur={() => touch("level")} className="sr-only" />
                {l.label}
              </label>
            ))}
          </div>
          {errorFor("level") && (
            <p role="alert" className="text-[13px] font-bold text-[#C62828]">
              ✶ {errorFor("level")}
            </p>
          )}
        </fieldset>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Langage principal prévu" optional placeholder="Go, TypeScript, Rust…" value={values.language ?? ""} onChange={(e) => set("language", e.target.value)} maxLength={40} />
          <SelectField label="Comment avez-vous connu le défi ?" optional value={values.referral ?? ""} onChange={(e) => set("referral", e.target.value)}>
            <option value="">Choisir…</option>
            {REFERRALS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectField>
        </div>
      </Section>

      <Section n="04" title="Vos engagements">
        <Checkbox
          checked={values.acceptRules}
          onChange={(e) => {
            set("acceptRules", e.target.checked);
            touch("acceptRules");
          }}
          error={errorFor("acceptRules")}
          label={
            <>
              J&apos;accepte les{" "}
              <Link href="/regles" target="_blank" className="font-extrabold underline decoration-kraken decoration-[3px] underline-offset-2">
                règles et le fair-play
              </Link>
              .
            </>
          }
        />
        <Checkbox
          checked={values.acceptTerms}
          onChange={(e) => {
            set("acceptTerms", e.target.checked);
            touch("acceptTerms");
          }}
          error={errorFor("acceptTerms")}
          label={
            <>
              J&apos;accepte les{" "}
              <Link href="/mentions" target="_blank" className="font-extrabold underline decoration-kraken decoration-[3px] underline-offset-2">
                conditions de participation
              </Link>{" "}
              (frais de 2 000 FCFA, remboursables 7 jours).
            </>
          }
        />
        <Checkbox
          checked={values.acceptData}
          onChange={(e) => {
            set("acceptData", e.target.checked);
            touch("acceptData");
          }}
          error={errorFor("acceptData")}
          label="J'accepte le traitement de mes données pour l'organisation du défi."
        />
        <Checkbox checked={Boolean(values.publicName)} onChange={(e) => set("publicName", e.target.checked)} label={<span className="text-steel">Facultatif : afficher mon nom (et non un pseudo) dans le classement public.</span>} />
      </Section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton pending={pending} pendingLabel="Inscription en cours…" className="w-full sm:w-auto">
          Créer mon inscription
        </SubmitButton>
        <p className="text-sm font-semibold text-steel">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-extrabold text-ink underline decoration-kraken decoration-[3px] underline-offset-2">
            Se connecter
          </Link>
        </p>
      </div>
    </form>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5 rounded-[26px] border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_#000] sm:p-7">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="flex size-10 items-center justify-center rounded-full bg-ink text-sm font-extrabold text-white">{n}</span>
        <span className="text-xl font-extrabold tracking-[-0.02em]">{title}</span>
      </div>
      {children}
    </fieldset>
  );
}

function GithubStatus({ state }: { state: GhState }) {
  if (state === "checking")
    return (
      <span className="flex items-center gap-1.5 text-[13px] font-bold text-steel">
        <Spinner className="size-4" /> Vérification…
      </span>
    );
  if (state === "ok") return <span className="rounded-full bg-kraken px-2.5 py-0.5 text-[12px] font-extrabold text-white">✓ Compte trouvé</span>;
  if (state === "missing") return <span className="rounded-full bg-[#C62828] px-2.5 py-0.5 text-[12px] font-extrabold text-white">Introuvable</span>;
  return null;
}

function CheckInbox({ email }: { email: string }) {
  const [pending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  return (
    <div className="flex flex-col gap-6 rounded-[30px] border-4 border-ink bg-white p-7 shadow-[10px_10px_0_#0047FF] sm:p-10" role="status">
      <span className="flex size-16 items-center justify-center rounded-full bg-kraken text-white" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </span>
      <h2 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Vérifiez votre boîte mail.</h2>
      <p className="text-lg leading-relaxed font-semibold">
        Un lien de confirmation vient d&apos;être envoyé à <strong className="break-all">{email}</strong>. Il est valable 24 heures et vous connecte directement à votre espace pour régler les frais.
      </p>
      <p className="text-sm font-semibold text-steel">Pensez à regarder dans les courriers indésirables ou l&apos;onglet Promotions.</p>
      <div className="flex flex-wrap gap-3">
        <SubmitButton
          type="button"
          tone="white"
          pending={pending}
          disabled={cooldown > 0}
          pendingLabel="Envoi…"
          onClick={() =>
            startTransition(async () => {
              const res = await resendVerificationAction(email);
              if (res.ok) toast.success(res.message);
              else toast.error(res.message);
              setCooldown(60);
            })
          }
        >
          {cooldown > 0 ? `Renvoyer le lien (${cooldown} s)` : "Renvoyer le lien"}
        </SubmitButton>
      </div>
    </div>
  );
}
