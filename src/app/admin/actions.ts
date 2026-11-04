"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { SITE_URL } from "@/config/site";
import { adminResetPath } from "@/lib/admin-path";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { isCloudinaryConfigured, uploadPrivateFile } from "@/lib/server/cloudinary";
import { encryptedKeys } from "@/lib/server/participants";
import { rateLimit, retryMessage } from "@/lib/server/rate-limit";
import { requireStaff } from "@/lib/server/session";
import { emailField } from "@/lib/validation";

type Result = { ok: true; message?: string } | { ok: false; error: string };

const id = z.string().min(1).max(64);
const resourceSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(2000).optional(),
  kind: z.enum(["file", "link", "docker_image"]),
  audience: z.enum(["participant", "public"]),
  availableAt: z.string().optional(),
  url: z.string().url().max(2000).optional(),
});

const submissionFieldSchema = z.object({
  label: z.string().trim().min(2).max(140),
  help: z.string().trim().max(500).optional(),
  type: z.enum(["short_text", "long_text", "url", "select", "checkbox", "file"]),
  required: z.boolean().default(false),
  options: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  accept: z.string().trim().max(250).optional(),
  maxFiles: z.number().int().min(1).max(5).default(1),
});

const submissionFormSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(2000).optional(),
  opensAt: z.string().optional(),
  closesAt: z.string().optional(),
  fields: z.array(submissionFieldSchema).min(1).max(30),
});

async function guardRate(userId: string, action: string, limit = 30, windowSec = 60): Promise<Result | null> {
  const r = await rateLimit(`admin:${action}:${userId}`, limit, windowSec);
  return r.ok ? null : { ok: false, error: retryMessage(r.retryAfter) };
}

/** Note interne sur un participant (administration et organisation). */
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

/** Renvoie le lien de confirmation ou de connexion (administration et organisation). */
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

/** Ajoute une ressource au catalogue sécurisé. Les fichiers restent privés dans Cloudinary. */
export async function createResourceAction(formData: FormData): Promise<Result> {
  const { session } = await requireStaff({ resource: ["create"] });
  const parsed = resourceSchema.safeParse({
    title: formData.get("title"), description: formData.get("description") || undefined, kind: formData.get("kind"), audience: formData.get("audience"),
    availableAt: formData.get("availableAt") || undefined, url: formData.get("url") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Vérifiez le titre, le type et le lien de la ressource." };
  const data = parsed.data;
  const availableAt = data.availableAt ? new Date(data.availableAt) : null;
  if (availableAt && Number.isNaN(availableAt.getTime())) return { ok: false, error: "Date d'ouverture invalide." };
  if (data.kind !== "file" && !data.url) return { ok: false, error: "Un lien ou une référence d'image Docker est requis." };

  let storageKey: string | undefined;
  let fileName: string | undefined;
  let contentType: string | undefined;
  let size: number | undefined;
  if (data.kind === "file") {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size < 1) return { ok: false, error: "Choisissez un fichier." };
    if (file.size > 4_000_000) return { ok: false, error: "Le fichier dépasse 4 Mo. Utilisez une image Docker publiée dans un registre pour les artefacts volumineux." };
    if (!isCloudinaryConfigured()) return { ok: false, error: "Cloudinary n'est pas encore configuré." };
    storageKey = await uploadPrivateFile(file, "kraken/resources");
    fileName = file.name.slice(0, 255);
    contentType = file.type || "application/octet-stream";
    size = file.size;
  }
  const resource = await db.resource.create({ data: { title: data.title, description: data.description, kind: data.kind, audience: data.audience, availableAt, url: data.kind === "file" ? null : data.url, storageKey, fileName, contentType, size, createdById: session.user.id } });
  await audit({ actorId: session.user.id, action: "resource.create", targetType: "resource", targetId: resource.id, meta: { kind: data.kind, audience: data.audience } });
  revalidatePath("/admin/ressources");
  return { ok: true, message: "Ressource enregistrée en brouillon." };
}

export async function setResourceStatusAction(resourceId: string, status: "published" | "archived" | "draft"): Promise<Result> {
  const { session } = await requireStaff({ resource: ["publish"] });
  if (!id.safeParse(resourceId).success) return { ok: false, error: "Ressource invalide." };
  const resource = await db.resource.update({ where: { id: resourceId }, data: { status, publishedAt: status === "published" ? new Date() : undefined, archivedAt: status === "archived" ? new Date() : undefined } });
  await audit({ actorId: session.user.id, action: `resource.${status}`, targetType: "resource", targetId: resource.id });
  revalidatePath("/admin/ressources");
  revalidatePath("/espace/documentation");
  return { ok: true, message: "Statut mis à jour." };
}

/** Crée un formulaire versionné de livraison, composé par l'organisation. */
export async function createSubmissionFormAction(input: unknown): Promise<Result> {
  const { session } = await requireStaff({ submissionForm: ["create"] });
  const parsed = submissionFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Vérifiez le titre et les champs du formulaire." };
  const { opensAt, closesAt, fields, ...data } = parsed.data;
  const open = opensAt ? new Date(opensAt) : null;
  const close = closesAt ? new Date(closesAt) : null;
  if ((open && Number.isNaN(open.getTime())) || (close && Number.isNaN(close.getTime())) || (open && close && close <= open)) return { ok: false, error: "Les dates d'ouverture et de fermeture sont invalides." };
  const form = await db.submissionForm.create({
    data: {
      ...data, opensAt: open, closesAt: close, createdById: session.user.id,
      fields: { create: fields.map((field, position) => ({ ...field, position, options: field.type === "select" ? field.options ?? [] : undefined, accept: field.type === "file" ? field.accept || undefined : undefined, maxFiles: field.type === "file" ? field.maxFiles : 1 })) },
    },
  });
  await audit({ actorId: session.user.id, action: "submissionForm.create", targetType: "submissionForm", targetId: form.id });
  revalidatePath("/admin/formulaires");
  return { ok: true, message: "Formulaire créé en brouillon." };
}

export async function setSubmissionFormStatusAction(formId: string, status: "draft" | "published" | "closed" | "archived"): Promise<Result> {
  const { session } = await requireStaff({ submissionForm: ["publish"] });
  if (!id.safeParse(formId).success) return { ok: false, error: "Formulaire invalide." };
  await db.submissionForm.update({ where: { id: formId }, data: { status } });
  await audit({ actorId: session.user.id, action: `submissionForm.${status}`, targetType: "submissionForm", targetId: formId });
  revalidatePath("/admin/formulaires");
  revalidatePath("/espace/livraison");
  return { ok: true, message: "Statut du formulaire mis à jour." };
}

/** Enregistre l'évaluation personnelle d'un membre du jury, sans écraser celles des autres. */
export async function saveEvaluationAction(input: unknown): Promise<Result> {
  const { session } = await requireStaff({ submission: ["evaluate"] });
  const parsed = z.object({ submissionId: id, score: z.number().int().min(0).max(100).nullable(), feedback: z.string().trim().max(5000).optional() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Évaluation invalide." };
  const submission = await db.submission.findUnique({ where: { id: parsed.data.submissionId }, select: { id: true } });
  if (!submission) return { ok: false, error: "Livraison introuvable." };
  await db.$transaction([
    db.submissionEvaluation.upsert({ where: { submissionId_reviewerId: { submissionId: submission.id, reviewerId: session.user.id } }, create: { submissionId: submission.id, reviewerId: session.user.id, score: parsed.data.score, feedback: parsed.data.feedback, submittedAt: new Date() }, update: { score: parsed.data.score, feedback: parsed.data.feedback, submittedAt: new Date() } }),
    db.submission.update({ where: { id: submission.id }, data: { status: "evaluated" } }),
  ]);
  await audit({ actorId: session.user.id, action: "submission.evaluate", targetType: "submission", targetId: submission.id });
  revalidatePath("/admin/soumissions");
  return { ok: true, message: "Évaluation enregistrée." };
}

const roleSchema = z.enum(["admin", "organizer", "jury"]);

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

  await auth.api.requestPasswordReset({ body: { email, redirectTo: `${SITE_URL}${adminResetPath()}` } });
  await audit({ actorId: session.user.id, action: "staff.invite", targetType: "user", targetId: user.id, meta: { role } });
  revalidatePath("/admin/equipe");
  return { ok: true, message: `Invitation envoyée à ${email}.` };
}

/** Change le rôle d'un membre de l'équipe ou lui retire l'accès (admin). */
export async function setStaffRoleAction(userId: string, role: "admin" | "organizer" | "jury" | "none"): Promise<Result> {
  const { session } = await requireStaff({ user: ["set-role"] });
  if (userId === session.user.id) return { ok: false, error: "Vous ne pouvez pas modifier votre propre rôle." };
  const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target || !["admin", "organizer", "jury"].includes(target.role ?? "")) return { ok: false, error: "Membre introuvable." };
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
