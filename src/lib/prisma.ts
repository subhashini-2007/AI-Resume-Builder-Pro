import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getSanitizedDatabaseUrl(): string | undefined {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return undefined;
  // Remove unsupported serverless parameter channel_binding=require if present
  return dbUrl.replace(/[?&]channel_binding=require/g, "");
}

const sanitizedUrl = getSanitizedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(sanitizedUrl ? { datasources: { db: { url: sanitizedUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
