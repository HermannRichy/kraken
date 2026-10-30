import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Contrôle d'accès partagé (serveur + client).
 * - admin       : tout, y compris rôles, remboursements, disqualifications, clés, réglages, export
 * - moderator   : lecture des participants, notes internes, renvoi d'e-mails
 * - participant : son propre espace uniquement
 */
export const statements = {
  ...defaultStatements,
  participant: ["read", "note", "resend", "update", "disqualify", "export"],
  keys: ["revoke"],
  settings: ["update"],
} as const;

export const ac = createAccessControl(statements);

export const roles = {
  admin: ac.newRole({
    ...adminAc.statements,
    participant: ["read", "note", "resend", "update", "disqualify", "export"],
    keys: ["revoke"],
    settings: ["update"],
  }),
  moderator: ac.newRole({
    participant: ["read", "note", "resend"],
  }),
  participant: ac.newRole({
    participant: [],
  }),
};

export type Role = keyof typeof roles;
export const STAFF_ROLES: Role[] = ["admin", "moderator"];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  moderator: "Modérateur",
  participant: "Participant",
};
