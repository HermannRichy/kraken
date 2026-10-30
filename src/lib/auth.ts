import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink, twoFactor } from "better-auth/plugins";

import { SITE_URL } from "@/config/site";
import { ac, roles } from "@/lib/permissions";
import { db } from "@/lib/server/db";
import { sendEmail } from "@/lib/server/email/send";
import { templates } from "@/lib/server/email/templates";
import { env } from "@/lib/server/env";
import { allowedOrigins } from "@/lib/server/request";

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  appName: "Kraken : Sold Out",
  baseURL: process.env.BETTER_AUTH_URL ?? SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  trustedOrigins: [...allowedOrigins()],

  // Équipe (admin, modérateurs) : e-mail + mot de passe + double authentification.
  // Aucune inscription publique par mot de passe : les comptes d'équipe sont créés par un admin.
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      // Premier mot de passe d'un membre invité : e-mail d'invitation plutôt que de réinitialisation.
      const hasPassword = await db.account.findFirst({ where: { userId: user.id, providerId: "credential" }, select: { id: true } });
      const role = (user as { role?: string }).role;
      const content =
        !hasPassword && (role === "admin" || role === "moderator")
          ? templates.staffInvite({ name: user.name, role: role === "admin" ? "Administrateur" : "Modérateur", url })
          : templates.passwordReset({ url });
      await sendEmail({ to: { email: user.email, name: user.name }, type: hasPassword ? "password_reset" : "staff_invite", content });
    },
  },

  // Participants : confirmation d'adresse valable 24 h, connexion automatique après confirmation.
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      const participant = await db.participant.findUnique({ where: { userId: user.id }, select: { id: true } });
      await sendEmail({
        to: { email: user.email, name: user.name },
        type: "verify_email",
        participantId: participant?.id,
        content: templates.verifyEmail({ name: user.name, url }),
      });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  user: {
    additionalFields: {
      role: { type: "string", required: false, input: false, defaultValue: "participant" },
    },
  },

  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/magic-link": { window: 300, max: 5 },
      "/sign-in/email": { window: 300, max: 5 },
      "/send-verification-email": { window: 600, max: 3 },
      "/request-password-reset": { window: 900, max: 3 },
      "/two-factor/verify-totp": { window: 300, max: 6 },
      "/two-factor/verify-backup-code": { window: 300, max: 6 },
    },
  },

  advanced: {
    cookiePrefix: "kraken",
    useSecureCookies: isProd,
    ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"] },
    defaultCookieAttributes: { sameSite: "lax", httpOnly: true, secure: isProd },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Le premier admin est désigné par FIRST_ADMIN_EMAIL.
          const role = user.email.toLowerCase() === env().FIRST_ADMIN_EMAIL.toLowerCase() ? "admin" : "participant";
          return { data: { ...user, role: (user as { role?: string }).role ?? role } };
        },
      },
      update: {
        after: async (user) => {
          // Adresse confirmée : le participant passe à « e-mail confirmé ».
          if (user.emailVerified) {
            await db.participant.updateMany({ where: { userId: user.id, status: "pre_registered" }, data: { status: "email_confirmed" } });
          }
        },
      },
    },
  },

  plugins: [
    admin({ ac, roles, defaultRole: "participant", adminRoles: ["admin"] }),
    magicLink({
      expiresIn: 15 * 60,
      disableSignUp: true,
      storeToken: "hashed",
      sendMagicLink: async ({ email, url }) => {
        const participant = await db.participant.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } });
        await sendEmail({ to: { email }, type: "magic_link", participantId: participant?.id, content: templates.magicLink({ url }) });
      },
    }),
    twoFactor({ issuer: "Kraken by HustlerLabs" }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
