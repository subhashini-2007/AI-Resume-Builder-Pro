import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getSanitizedDatabaseUrl(): string | undefined {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return undefined;
  let url = dbUrl.replace(/[?&]channel_binding=require/g, "");
  if (url.includes("-pooler") && !url.includes("pgbouncer=true")) {
    url += url.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
  }
  return url;
}

const sanitizedUrl = getSanitizedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(sanitizedUrl ? { datasources: { db: { url: sanitizedUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
