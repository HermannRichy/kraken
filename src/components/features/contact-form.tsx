"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { contactAction } from "@/app/organisateur/actions";
import { SubmitButton, TextareaField, TextField } from "@/components/form/fields";
import { CAPTCHA_WAIT, Turnstile, useCaptcha } from "@/components/form/turnstile";
import { Pop } from "@/components/motion/pop";
import { Burst } from "@/components/ui/doodles";
import { contactSchema, fieldErrors } from "@/lib/validation";

/** Formulaire de contact : validé dans le navigateur et sur le serveur, enregistré et transmis par e-mail. */
export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const startedAt = useRef(0);
  const [pending, startTransition] = useTransition();
  const captcha = useCaptcha();

  const set = (k: keyof typeof values, v: string) => {
    if (!startedAt.current) startedAt.current = Date.now();
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = { ...values, startedAt: startedAt.current || Date.now(), captcha: captcha.token ?? undefined };
    const parsed = contactSchema.safeParse(input);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    if (!captcha.ready) return setErrors({ captcha: CAPTCHA_WAIT });
    startTransition(async () => {
      const res = await contactAction(input);
      captcha.reset();
      if (res.ok) {
        setSent(true);
        toast.success("Message envoyé", { description: "Un accusé de réception vient de partir dans votre boîte mail." });
      } else {
        setErrors(res.errors ?? {});
        toast.error(res.message);
      }
    });
  };

  return (
    <Pop lift={-6} scale={1.01}>
      <div className="rounded-[32px] border-4 border-ink bg-paper p-6 shadow-[12px_12px_0_#000] [transform:perspective(1200px)_rotateY(-7deg)_rotateX(3deg)_rotateZ(1.2deg)] sm:p-[34px]">
        {sent ? (
          <div role="status" className="flex flex-col gap-4">
            <h2 className="text-3xl font-extrabold tracking-[-0.02em]">Message envoyé.</h2>
            <p className="font-semibold">Merci ! L&apos;équipe HustlerLabs revient vers vous rapidement.</p>
            <button type="button" onClick={() => { setSent(false); setValues({ name: "", email: "", message: "", website: "" }); }} className="self-start font-extrabold underline decoration-kraken decoration-[3px] underline-offset-4">
              Écrire un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-[18px]">
            <h2 className="text-3xl font-extrabold tracking-[-0.02em]">Écrire à l&apos;organisation</h2>
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label>
                Site web
                <input tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website", e.target.value)} />
              </label>
            </div>
            <TextField label="Nom complet" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} error={errors.name} maxLength={80} required />
            <TextField label="E-mail" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} error={errors.email} maxLength={254} required />
            <TextareaField label="Message" value={values.message} onChange={(e) => set("message", e.target.value)} error={errors.message} maxLength={3000} hint={`${values.message.length}/3000`} required />
            <Turnstile nonce={captcha.nonce} action="contact" onToken={captcha.setToken} error={errors.captcha} />
            <SubmitButton pending={pending} pendingLabel="Envoi…" className="self-start">
              Envoyer
            </SubmitButton>
          </form>
        )}
      </div>
      <Burst flip size={44} className="-top-6 -right-3.5" />
    </Pop>
  );
}
