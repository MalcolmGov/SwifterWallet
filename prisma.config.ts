import "dotenv/config";
import { defineConfig } from "prisma/config";

// Fall back to a placeholder at build time so deployments don't fail when
// DATABASE_URL isn't set. At runtime, Prisma Client reads DATABASE_URL from
// the environment directly, so real DB calls still require the real value.
const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
