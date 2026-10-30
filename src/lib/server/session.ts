import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { roles, type Role } from "@/lib/permissions";

import { db } from "./db";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Participant connecté (sinon redirection vers la connexion). */
export async function requireParticipant() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const participant = await db.participant.findUnique({ where: { userId: session.user.id } });
  if (!participant) {
    if (session.user.role === "admin" || session.user.role === "moderator") redirect("/admin");
    redirect("/inscription");
  }
  // Rattrapage : adresse confirmée mais statut pas encore à jour.
  if (participant.status === "pre_registered" && session.user.emailVerified) {
    const updated = await db.participant.update({ where: { id: participant.id }, data: { status: "email_confirmed" } });
    return { session, participant: updated };
  }
  return { session, participant };
}

type Permission = { [K in keyof (typeof roles)["admin"]["statements"]]?: string[] };

/** Membre de l'équipe connecté, double authentification activée, avec la permission demandée. */
export async function requireStaff(permission?: Permission, { allowWithout2fa = false } = {}) {
  const session = await getSession();
  if (!session) redirect("/admin/connexion");
  const role = (session.user.role ?? "participant") as Role;
  if (role !== "admin" && role !== "moderator") redirect("/espace");
  if (!allowWithout2fa && !session.user.twoFactorEnabled) redirect("/admin/securite");
  if (permission && !can(role, permission)) redirect("/admin?refus=1");
  return { session, role };
}

export function can(role: Role, permission: Permission) {
  const r = roles[role] as unknown as { authorize: (p: Permission) => { success: boolean } };
  return r.authorize(permission).success;
}
