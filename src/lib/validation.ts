import { isValidPhoneNumber, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { z } from "zod";

import { NETWORKS } from "@/config/payment";

/**
 * Schémas de validation partagés entre le navigateur (retour immédiat)
 * et le serveur (seule validation qui fait foi).
 */

export const LEVELS = [
  { value: "etudiant", label: "Étudiant" },
  { value: "junior", label: "Junior" },
  { value: "confirme", label: "Confirmé" },
  { value: "senior", label: "Senior" },
] as const;

export const REFERRALS = ["WhatsApp", "LinkedIn", "X (Twitter)", "Facebook", "Un ami ou un collègue", "École ou université", "Autre"] as const;

export const CONSENT_VERSION = "2026-10-30";

const trimmed = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} est requis.` })
    .trim()
    .min(min, `${label} : ${min} caractères minimum.`)
    .max(max, `${label} : ${max} caractères maximum.`);

export const githubLogin = z
  .string()
  .trim()
  .min(1, "L'identifiant GitHub est requis.")
  .max(39, "39 caractères maximum.")
  .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "Identifiant GitHub invalide (lettres, chiffres et tirets).")
  .transform((v) => v.replace(/^@/, ""));

export const emailField = z
  .string({ error: "L'e-mail est requis." })
  .trim()
  .toLowerCase()
  .max(254, "E-mail trop long.")
  .pipe(z.email("Adresse e-mail invalide."));

export const countryCode = z.string().regex(/^[A-Z]{2}$/, "Choisissez un pays.");

export const registrationSchema = z
  .object({
    fullName: trimmed(3, 80, "Le nom complet").regex(/^[\p{L}][\p{L}\p{M}' .-]+$/u, "Lettres, espaces, apostrophes et tirets uniquement."),
    email: emailField,
    phoneCountry: countryCode,
    phone: z.string().trim().min(6, "Numéro trop court.").max(20, "Numéro trop long."),
    country: countryCode,
    city: trimmed(2, 80, "La ville"),
    github: githubLogin,
    level: z.enum(["etudiant", "junior", "confirme", "senior"], { error: "Choisissez votre niveau." }),
    language: z.string().trim().max(40, "40 caractères maximum.").optional().or(z.literal("")),
    referral: z.string().trim().max(80).optional().or(z.literal("")),
    acceptRules: z.literal(true, { error: "Vous devez accepter les règles et le fair-play." }),
    acceptTerms: z.literal(true, { error: "Vous devez accepter les conditions de participation." }),
    acceptData: z.literal(true, { error: "Vous devez accepter le traitement de vos données." }),
    publicName: z.boolean().default(false),
    // Anti-spam
    website: z.string().max(0, "Champ invalide.").optional().or(z.literal("")),
    startedAt: z.number().int().positive(),
    captcha: z.string().max(2048).optional(),
  })
  .superRefine((v, ctx) => {
    if (!isValidPhoneNumber(v.phone, v.phoneCountry as CountryCode)) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Numéro invalide pour ce pays." });
    }
  });

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationData = z.output<typeof registrationSchema>;

/** Numéro au format international E.164 (+22901...). */
export function toE164(phone: string, country: string) {
  return parsePhoneNumberFromString(phone, country as CountryCode)?.number ?? phone;
}

export const contactSchema = z.object({
  name: trimmed(2, 80, "Le nom"),
  email: emailField,
  message: trimmed(10, 3000, "Le message"),
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.number().int().positive(),
  captcha: z.string().max(2048).optional(),
});

export type ContactInput = z.input<typeof contactSchema>;

const networkSlugs = NETWORKS.map((n) => n.slug) as [string, ...string[]];

export const paymentSchema = z
  .object({
    network: z.enum(networkSlugs, { error: "Choisissez votre réseau Mobile Money." }),
    phone: z.string().trim().min(6, "Numéro trop court.").max(20, "Numéro trop long."),
    idempotencyKey: z.uuid(),
  })
  .superRefine((v, ctx) => {
    const net = NETWORKS.find((n) => n.slug === v.network);
    if (net && !isValidPhoneNumber(v.phone, net.country as CountryCode)) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: `Numéro invalide pour ${net.label}.` });
    }
  });

export type PaymentInput = z.input<typeof paymentSchema>;

/** Erreurs zod → { champ: message } pour l'affichage sous chaque champ. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
