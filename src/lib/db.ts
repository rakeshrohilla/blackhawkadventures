import { createPrismaClient } from "./prisma-factory";

function client() {
  return createPrismaClient(
    process.env.DATABASE_URL,
    process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  );
}

// Reuse the client across hot reloads in dev so we don't exhaust connections.
const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof client> };

export const prisma = globalForPrisma.prisma ?? client();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
