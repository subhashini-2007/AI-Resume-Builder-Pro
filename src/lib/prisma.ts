import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getSanitizedDatabaseUrl(): string | undefined {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return undefined;
  try {
    const parsed = new URL(dbUrl);
    parsed.searchParams.delete("channel_binding");
    if (parsed.hostname.includes("-pooler") && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    return parsed.toString();
  } catch {
    // Fallback if URL constructor fails on unconventional connection string formats
    let url = dbUrl.replace(/([?&])channel_binding=[^&]*&?/g, "$1").replace(/[?&]$/, "");
    if (url.includes("-pooler") && !url.includes("pgbouncer=true")) {
      url += url.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
    }
    return url;
  }
}

const sanitizedUrl = getSanitizedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(sanitizedUrl ? { datasources: { db: { url: sanitizedUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

