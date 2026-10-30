"use client";

import { adminClient, magicLinkClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ac, roles } from "@/lib/permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({ ac, roles }),
    magicLinkClient(),
    // La redirection vers l'étape 2FA est gérée par le formulaire de connexion de l'équipe.
    twoFactorClient(),
  ],
});
