"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { SITE_URL } from "@/config/site";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { encryptedKeys } from "@/lib/server/participants";
import { rateLimit, retryMessage } from "@/lib/server/rate-limit";
import { requireStaff } from "@/lib/server/session";
import { emailField } from "@/lib/validation";

type Result = { ok: true; message?: string } | { ok: false; error: string };

const id = z.string().min(1).max(64);

async function guardRate(userId: string, action: string, limit = 30, windowSec = 60): Promise<Result | null> {
  const r = await rateLimit(`admin:${action}:${userId}`, limit, windowSec);
  return r.ok ? null : { ok: false, error: retryMessage(r.retryAfter) };
}

/** Note interne sur un participant (admin et modérateurs). */
export async function addNoteAction(participantId: string, body: string): Promise<Result> {
  const { session } = await requireStaff({ participant: ["note"] });
  const limited = await guardRate(session.user.id, "note");
  if (limited) return limited;
  const parsed = z.object({ participantId: id, body: z.string().trim().min(2, "Note trop courte.").max(2000) }).safeParse({ participantId, body });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Note invalide." };
  await db.note.create({ data: { participantId, authorId: session.user.id, body: parsed.data.body } });
  revalidatePath(`/admin/participants/${participantId}`);
  return { ok: true };
}

/** Renvoie le lien de confirmation ou de connexion (admin et modérateurs). */
export async function resendEmailAction(participantId: string, kind: "verify" | "login"): Promise<Result> {
  const { session } = await requireStaff({ participant: ["resend"] });
  const limited = await guardRate(session.user.id, "resend", 10, 60);
  if (limited) return limited;
  const p = await db.participant.findUnique({ where: { id: participantId }, include: { user: { select: { emailVerified: true } } } });
  if (!p) return { ok: false, error: "Participant introuvable." };
  if (kind === "verify") {
    if (p.user.emailVerified) return { ok: false, error: "Adresse déjà confirmée." };
    await auth.api.sendVerificationEmail({ body: { email: p.email, callbackURL: "/espace?bienvenue=1" } });
  } else {
    await auth.api.signInMagicLink({ body: { email: p.email, callbackURL: "/espace" }, headers: new Headers() });
  }
  await audit({ actorId: session.user.id, action: `email.resend.${kind}`, targetType: "participant", targetId: p.id });
  revalidatePath(`/admin/participants/${participantId}`);
  return { ok: true, message: "E-mail envoyé." };
}

/** Disqualification avec motif obligatoire (admin). */
export async function disqualifyAction(participantId: string, reason: string): Promise<Result> {
  const { session } = await requireStaff({ participant: ["disqualify"] });
  const parsed = z.string().trim().min(5, "Motif obligatoire (5 caractères minimum).").max(500).safeParse(reason);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Motif invalide." };
  await db.participant.update({ where: { id: participantId }, data: { status: "disqualified", disqualifiedReason: parsed.data } });
  await audit({ actorId: session.user.id, action: "participant.disqualify", targetType: "participant", targetId: participantId, meta: { reason: parsed.data } });
  revalidatePath(`/admin/participants/${participantId}`);
  return { ok: true, message: "Participant disqualifié." };
}

/** Désistement (admin). Le remboursement Mobile Money se fait depuis le dashboard FeexPay. */
export async function withdrawAction(participantId: string, refunded: boolean): Promise<Result> {
  const { session } = await requireStaff({ participant: ["update"] });
  const p = await db.participant.findUnique({ where: { id: participantId }, include: { payments: { where: { status: "succeeded" } } } });
  if (!p) return { ok: false, error: "Participant introuvable." };
  await db.$transaction(async (tx) => {
    await tx.participant.update({ where: { id: participantId }, data: { status: "withdrawn", withdrawnAt: new Date(), testKeyEnc: null, webhookSecretEnc: null } });
    if (refunded && p.payments.length) await tx.payment.updateMany({ where: { participantId, status: "succeeded" }, data: { status: "refunded" } });
  });
  await audit({ actorId: session.user.id, action: refunded ? "participant.withdraw.refund" : "participant.withdraw", targetType: "participant", targetId: participantId });
  revalidatePath(`/admin/participants/${participantId}`);
  return { ok: true, message: refunded ? "Désistement et remboursement enregistrés." : "Désistement enregistré." };
}

/** Révoque et régénère les clés de test (admin). */
export async function regenerateParticipantKeysAction(participantId: string): Promise<Result> {
  const { session } = await requireStaff({ keys: ["revoke"] });
  const p = await db.participant.findUnique({ where: { id: participantId }, select: { status: true } });
  if (p?.status !== "registered") return { ok: false, error: "Clés disponibles uniquement pour un participant inscrit." };
  await db.participant.update({ where: { id: participantId }, data: encryptedKeys() });
  await audit({ actorId: session.user.id, action: "keys.regenerate.admin", targetType: "participant", targetId: participantId });
  revalidatePath(`/admin/participants/${participantId}`);
  return { ok: true, message: "Nouvelles clés émises, anciennes révoquées." };
}

/** Plafond de places (admin). */
export async function setSeatsCapAction(value: number): Promise<Result> {
  const { session } = await requireStaff({ settings: ["update"] });
  const parsed = z.number().int().min(1).max(10_000).safeParse(value);
  if (!parsed.success) return { ok: false, error: "Valeur invalide (1 à 10 000)." };
  await db.appSetting.upsert({ where: { key: "seatsCap" }, create: { key: "seatsCap", value: parsed.data }, update: { value: parsed.data } });
  await audit({ actorId: session.user.id, action: "settings.seatsCap", targetType: "setting", targetId: "seatsCap", meta: { value: parsed.data } });
  revalidatePath("/admin");
  return { ok: true, message: "Plafond mis à jour." };
}

const roleSchema = z.enum(["admin", "moderator"]);

/** Invite un membre de l'équipe : compte créé, lien pour définir le mot de passe (admin). */
export async function inviteStaffAction(input: { name: string; email: string; role: string }): Promise<Result> {
  const { session } = await requireStaff({ user: ["create"] });
  const limited = await guardRate(session.user.id, "invite", 10, 3600);
  if (limited) return limited;
  const parsed = z.object({ name: z.string().trim().min(2).max(80), email: emailField, role: roleSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Nom, e-mail ou rôle invalide." };
  const { name, email, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email }, include: { participant: { select: { id: true } } } });
  if (existing?.participant) return { ok: false, error: "Cette adresse appartient à un participant." };
  const user = existing
    ? await db.user.update({ where: { id: existing.id }, data: { role } })
    : await db.user.create({ data: { id: randomUUID(), name, email, emailVerified: true, role } });

  await auth.api.requestPasswordReset({ body: { email, redirectTo: `${SITE_URL}/admin/mot-de-passe` } });
  await audit({ actorId: session.user.id, action: "staff.invite", targetType: "user", targetId: user.id, meta: { role } });
  revalidatePath("/admin/equipe");
  return { ok: true, message: `Invitation envoyée à ${email}.` };
}

/** Change le rôle d'un membre de l'équipe ou lui retire l'accès (admin). */
export async function setStaffRoleAction(userId: string, role: "admin" | "moderator" | "none"): Promise<Result> {
  const { session } = await requireStaff({ user: ["set-role"] });
  if (userId === session.user.id) return { ok: false, error: "Vous ne pouvez pas modifier votre propre rôle." };
  const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target || (target.role !== "admin" && target.role !== "moderator")) return { ok: false, error: "Membre introuvable." };
  if (target.role === "admin" && role !== "admin") {
    const admins = await db.user.count({ where: { role: "admin" } });
    if (admins <= 1) return { ok: false, error: "Il doit rester au moins un administrateur." };
  }
  await db.user.update({ where: { id: userId }, data: { role: role === "none" ? "participant" : role } });
  if (role === "none") await db.session.deleteMany({ where: { userId } });
  await audit({ actorId: session.user.id, action: "staff.role", targetType: "user", targetId: userId, meta: { role } });
  revalidatePath("/admin/equipe");
  return { ok: true, message: role === "none" ? "Accès retiré." : "Rôle mis à jour." };
}
