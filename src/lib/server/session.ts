import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";

import { adminGate } from "@/lib/admin-path";

import { auth } from "@/lib/auth";
import { STAFF_ROLES, roles, type Role } from "@/lib/permissions";

import { db } from "./db";

/** Session de la requête (dédupliquée entre layout et page). */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Participant connecté (sinon redirection vers la connexion). Dédupliqué par requête. */
export const requireParticipant = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const participant = await db.participant.findUnique({ where: { userId: session.user.id } });
  if (!participant) {
    if (STAFF_ROLES.includes(session.user.role as Role)) redirect("/admin");
    redirect("/inscription");
  }
  // Rattrapage : adresse confirmée mais statut pas encore à jour.
  if (participant.status === "pre_registered" && session.user.emailVerified) {
    const updated = await db.participant.update({ where: { id: participant.id }, data: { status: "email_confirmed" } });
    return { session, participant: updated };
  }
  return { session, participant };
});

type Permission = { [K in keyof (typeof roles)["admin"]["statements"]]?: string[] };

/** Membre de l'équipe connecté, double authentification activée, avec la permission demandée. */
export async function requireStaff(permission?: Permission, { allowWithout2fa = false } = {}) {
  const session = await getSession();
  // Sans session ou sans rôle d'équipe : 404, l'administration ne se signale pas.
  if (!session) return adminGate() ? notFound() : redirect("/admin/connexion");
  const role = (session.user.role ?? "participant") as Role;
  if (!STAFF_ROLES.includes(role)) notFound();
  if (!allowWithout2fa && !session.user.twoFactorEnabled) redirect("/admin/securite");
  if (permission && !can(role, permission)) redirect("/admin?refus=1");
  return { session, role };
}

export function can(role: Role, permission: Permission) {
  const r = roles[role] as unknown as { authorize: (p: Permission) => { success: boolean } };
  return r.authorize(permission).success;
}
