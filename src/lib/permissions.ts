import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Contrôle d'accès partagé (serveur + client).
 * - admin       : tout, y compris rôles, remboursements, disqualifications, clés, réglages, export
 * - organizer   : gestion opérationnelle, ressources et formulaires de livraison
 * - jury        : lecture des livraisons et évaluation, sans données de paiement ni réglages
 * - participant : son propre espace uniquement
 */
export const statements = {
  ...defaultStatements,
  participant: ["read", "note", "resend", "update", "disqualify", "export"],
  keys: ["revoke"],
  settings: ["update"],
  resource: ["read", "create", "update", "delete", "publish"],
  submissionForm: ["read", "create", "update", "delete", "publish"],
  submission: ["read", "update", "evaluate", "export"],
} as const;

export const ac = createAccessControl(statements);

export const roles = {
  admin: ac.newRole({
    ...adminAc.statements,
    participant: ["read", "note", "resend", "update", "disqualify", "export"],
    keys: ["revoke"],
    settings: ["update"],
    resource: ["read", "create", "update", "delete", "publish"],
    submissionForm: ["read", "create", "update", "delete", "publish"],
    submission: ["read", "update", "evaluate", "export"],
  }),
  organizer: ac.newRole({
    participant: ["read", "note", "resend"],
    resource: ["read", "create", "update", "delete", "publish"],
    submissionForm: ["read", "create", "update", "delete", "publish"],
    submission: ["read", "update", "export"],
  }),
  jury: ac.newRole({
    submission: ["read", "evaluate", "export"],
  }),
  participant: ac.newRole({
    participant: [],
  }),
};

export type Role = keyof typeof roles;
export const STAFF_ROLES: Role[] = ["admin", "organizer", "jury"];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  organizer: "Organisateur",
  jury: "Jury",
  participant: "Participant",
};
