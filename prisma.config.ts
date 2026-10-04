import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 reads the connection URL from here rather than from schema.prisma.
 *
 * It is attached only when DATABASE_URL is actually set: `prisma generate` runs
 * on every `npm install` and needs no database, so demanding the variable here
 * would break a fresh clone before the developer has written their .env. The
 * commands that genuinely need it (migrate, db push, studio) still fail with
 * Prisma's own clear message when it is missing.
 */
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
