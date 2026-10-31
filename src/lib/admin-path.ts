/**
 * Adresse de connexion de l'équipe, non publique.
 * ADMIN_PATH (ex. « console-7f3a9c2e41 ») remplace /admin/connexion : l'adresse d'origine
 * et toute page /admin sans session répondent alors 404, sans révéler l'existence de l'administration.
 * Sans ADMIN_PATH (développement), /admin/connexion reste accessible.
 */
export function adminGate(): string | null {
  const raw = process.env.ADMIN_PATH?.trim().replace(/^\/+|\/+$/g, "");
  if (!raw || !/^[A-Za-z0-9_-]{8,64}$/.test(raw)) return null;
  return `/${raw}`;
}

export const adminLoginPath = () => adminGate() ?? "/admin/connexion";
export const adminResetPath = () => `${adminGate() ?? "/admin"}/mot-de-passe`;
