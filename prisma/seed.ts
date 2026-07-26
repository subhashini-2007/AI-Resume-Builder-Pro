import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up existing templates...");
  await prisma.resumeTemplate.deleteMany({});

  console.log("Cleaning up existing tasks...");
  await prisma.userTask.deleteMany({});

  console.log("Seeding templates...");

  const templates = [
    {
      name: "ATS Classic",
      category: "ats",
      styles: { fontFamily: "Inter", fontSize: "11px", spacing: "normal" },
      config: { maxPages: 1, columns: 1 },
    },
    {
      name: "Modern Executive",
      category: "modern",
      styles: { fontFamily: "Inter", fontSize: "11px", spacing: "relaxed" },
      config: { maxPages: 2, columns: 2 },
    },
    {
      name: "Minimal Clean",
      category: "minimal",
      styles: { fontFamily: "Roboto", fontSize: "11px", spacing: "compact" },
      config: { maxPages: 1, columns: 1 },
    },
    {
      name: "Executive Serif",
      category: "executive",
      styles: { fontFamily: "Merriweather", fontSize: "11px", spacing: "relaxed" },
      config: { maxPages: 2, columns: 1 },
    },
    {
      name: "Creative Accent",
      category: "creative",
      styles: { fontFamily: "Poppins", fontSize: "11px", spacing: "normal" },
      config: { maxPages: 1, columns: 2 },
    },
    {
      name: "Corporate Standard",
      category: "corporate",
      styles: { fontFamily: "Inter", fontSize: "11px", spacing: "compact" },
      config: { maxPages: 1, columns: 1 },
    },
    {
      name: "Elegant Amber",
      category: "elegant",
      styles: { fontFamily: "Playfair Display", fontSize: "11px", spacing: "relaxed" },
      config: { maxPages: 1, columns: 1 },
    },
    {
      name: "Compact Grid",
      category: "compact",
      styles: { fontFamily: "Inter", fontSize: "10px", spacing: "compact" },
      config: { maxPages: 1, columns: 1 },
    },
    {
      name: "Student Entry",
      category: "student",
      styles: { fontFamily: "Inter", fontSize: "11px", spacing: "normal" },
      config: { maxPages: 1, columns: 1 },
    },
    {
      name: "Developer Terminal",
      category: "developer",
      styles: { fontFamily: "Fira Code", fontSize: "10px", spacing: "compact" },
      config: { maxPages: 1, columns: 1 },
    },
  ];

  for (const template of templates) {
    await prisma.resumeTemplate.create({
      data: {
        name: template.name,
        category: template.category,
        styles: template.styles,
        config: template.config,
      },
    });
  }

  console.log("Seeding default user...");
  // Hash seed user password properly so they can log in
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);

  const defaultUser = await prisma.user.upsert({
    where: { email: "subhashini@resumebuilder.pro" },
    update: {
      passwordHash,
    },
    create: {
      email: "subhashini@resumebuilder.pro",
      passwordHash,
      name: "Subhashini",
      settings: {
        create: {
          theme: "system",
          emailNotifications: true,
        },
      },
      subscription: {
        create: {
          plan: "PRO",
          status: "ACTIVE",
        },
      },
    },
  });

  console.log("Seeding default tasks...");
  await prisma.userTask.createMany({
    data: [
      { userId: defaultUser.id, title: "Core Profile Foundation", status: "Completed", order: 0 },
      { userId: defaultUser.id, title: "AI Keyword Alignment", status: "In Progress", order: 1 },
      { userId: defaultUser.id, title: "Cover Letter Tailoring", status: "Upcoming", order: 2 },
      { userId: defaultUser.id, title: "Interview Confidence Check", status: "Upcoming", order: 3 },
    ],
  });

  console.log("Database seeded successfully. Generated user ID:", defaultUser.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
