const { PrismaClient } = require("@prisma/client");

function getSanitizedDatabaseUrl() {
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
    let url = dbUrl.replace(/([?&])channel_binding=[^&]*&?/g, "$1").replace(/[?&]$/, "");
    if (url.includes("-pooler") && !url.includes("pgbouncer=true")) {
      url += url.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
    }
    return url;
  }
}

const sanitizedUrl = getSanitizedDatabaseUrl();
console.log("Sanitized URL:", sanitizedUrl);

const prisma = new PrismaClient({
  ...(sanitizedUrl ? { datasources: { db: { url: sanitizedUrl } } } : {}),
});

async function test() {
  const userId = "00000000-0000-0000-0000-000000000000";
  
  console.log("--- Testing prisma.resume.count ---");
  try {
    const count = await prisma.resume.count({
      where: {
        userId,
        deletedAt: null
      }
    });
    console.log("Count succeeded:", count);
  } catch (error) {
    console.error("Count failed!");
    console.error(error);
    console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  }

  console.log("\n--- Testing prisma.resume.create ---");
  try {
    const draft = await prisma.resume.create({
      data: {
        userId,
        title: "New Resume Draft",
        summary: "",
        selectedTemplate: "ats-classic",
        status: "DRAFT",
      }
    });
    console.log("Create succeeded:", draft);
  } catch (error) {
    console.error("Create failed!");
    console.error(error);
    console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
