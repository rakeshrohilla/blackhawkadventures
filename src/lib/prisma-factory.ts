import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

export type PrismaLogLevel = "query" | "info" | "warn" | "error";

/**
 * Builds a PrismaClient for whichever kind of DATABASE_URL it is given.
 *
 *   postgres:// | postgresql://      a normal Postgres server (Neon, Supabase,
 *                                    RDS, local) over the pg driver adapter.
 *   prisma+postgres:// | prisma://   Prisma Postgres / Accelerate, which is an
 *                                    HTTP pool rather than a TCP connection.
 *
 * Vercel's Prisma Postgres integration injects the second kind, so both the app
 * and the command-line scripts need to handle either.
 */
export function createPrismaClient(
  connectionString: string | undefined,
  log: PrismaLogLevel[] = ["error"],
) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }

  if (connectionString.startsWith("prisma://") || connectionString.startsWith("prisma+postgres://")) {
    return new PrismaClient({ accelerateUrl: connectionString, log });
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }), log });
}
