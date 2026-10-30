"use server";

import { randomUUID } from "node:crypto";

import type { ConsentKind } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { hashIp } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { checkGithubUser } from "@/lib/server/participants";
import { rateLimitAll, retryMessage } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import { CONSENT_VERSION, emailField, fieldErrors, registrationSchema, toE164, type RegistrationInput } from "@/lib/validation";

export type RegisterResult = { ok: true; email: string } | { ok: false; message: string; errors?: Record<string, string> };

const MIN_FILL_MS = 4_000;

/** Inscription : validation, unicité, enregistrement, puis e-mail de confirmation (24 h). */
export async function registerAction(input: RegistrationInput): Promise<RegisterResult> {
  const ip = await getClientIp();
  const ipHash = hashIp(ip) ?? "unknown";

  const limit = await rateLimitAll([
    [`register:ip:${ipHash}`, 5, 60 * 60],
    [`register:ip-burst:${ipHash}`, 2, 60],
  ]);
  if (!limit.ok) return { ok: false, message: retryMessage(limit.retryAfter) };

  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Certains champs sont à corriger.", errors: fieldErrors(parsed.error) };
  const data = parsed.data;

  // Anti-robot : champ piège rempli ou formulaire envoyé trop vite.
  if (data.website || Date.now() - data.startedAt < MIN_FILL_MS) {
    return { ok: false, message: "Envoi refusé. Prenez le temps de remplir le formulaire." };
  }

  const phone = toE164(data.phone, data.phoneCountry);
  const github = data.github.toLowerCase();

  // Doublons (un compte par e-mail, par GitHub et par téléphone)
  const [byEmail, byGithub, byPhone, userByEmail] = await Promise.all([
    db.participant.findUnique({ where: { email: data.email }, select: { id: true } }),
    db.participant.findUnique({ where: { githubLogin: github }, select: { id: true } }),
    db.participant.findUnique({ where: { phone }, select: { id: true } }),
    db.user.findUnique({ where: { email: data.email }, select: { id: true } }),
  ]);
  const errors: Record<string, string> = {};
  if (byEmail || userByEmail) errors.email = "Cette adresse est déjà inscrite. Connectez-vous ou renvoyez le lien de confirmation.";
  if (byGithub) errors.github = "Ce compte GitHub est déjà inscrit.";
  if (byPhone) errors.phone = "Ce numéro est déjà inscrit.";
  if (Object.keys(errors).length) return { ok: false, message: "Un compte existe déjà avec ces informations.", errors };

  const gh = await checkGithubUser(github);
  if (!gh.exists) return { ok: false, message: "Compte GitHub introuvable.", errors: { github: "Aucun compte GitHub ne correspond à cet identifiant." } };

  try {
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { id: randomUUID(), name: data.fullName, email: data.email, emailVerified: false, role: "participant" },
      });
      const participant = await tx.participant.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          email: data.email,
          phone,
          country: data.country,
          city: data.city,
          githubLogin: github,
          githubId: gh.id ?? null,
          level: data.level,
          language: data.language || null,
          referral: data.referral || null,
          publicName: data.publicName,
          registrationIpHash: ipHash,
        },
      });
      const kinds: ConsentKind[] = ["rules", "terms", "data", ...(data.publicName ? (["public_name"] as const) : [])];
      await tx.consent.createMany({ data: kinds.map((kind) => ({ participantId: participant.id, kind, version: CONSENT_VERSION })) });
    });
  } catch (error) {
    // Course entre deux envois simultanés : la contrainte d'unicité tranche.
    if ((error as { code?: string }).code === "P2002") {
      return { ok: false, message: "Un compte existe déjà avec ces informations." };
    }
    console.error("[inscription]", error);
    return { ok: false, message: "Une erreur est survenue. Réessayez dans un instant." };
  }

  await auth.api.sendVerificationEmail({ body: { email: data.email, callbackURL: "/espace?bienvenue=1" } }).catch((e) => console.error("[inscription] e-mail", e));
  return { ok: true, email: data.email };
}

/** Renvoi du lien de confirmation (réponse identique que le compte existe ou non). */
export async function resendVerificationAction(rawEmail: string): Promise<{ ok: boolean; message: string }> {
  const parsed = emailField.safeParse(rawEmail);
  if (!parsed.success) return { ok: false, message: "Adresse e-mail invalide." };
  const email = parsed.data;
  const ipHash = hashIp(await getClientIp()) ?? "unknown";
  const limit = await rateLimitAll([
    [`resend:email:${email}`, 3, 60 * 30],
    [`resend:ip:${ipHash}`, 10, 60 * 60],
  ]);
  if (!limit.ok) return { ok: false, message: retryMessage(limit.retryAfter) };

  const user = await db.user.findUnique({ where: { email }, select: { emailVerified: true } });
  if (user && !user.emailVerified) {
    await auth.api.sendVerificationEmail({ body: { email, callbackURL: "/espace?bienvenue=1" } }).catch(() => {});
  }
  return { ok: true, message: "Si une inscription non confirmée existe pour cette adresse, un nouveau lien vient d'être envoyé." };
}
