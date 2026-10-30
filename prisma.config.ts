import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Neon : utiliser l'URL directe (non poolée) pour les migrations.
    url: env("DIRECT_URL"),
  },
});
