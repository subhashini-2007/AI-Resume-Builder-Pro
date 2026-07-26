# Backend Database Setup Guide - AI Resume Builder Pro

This document details instructions to initialize the PostgreSQL database schema, run seeder scripts, integrate client-side queries, and use the database service classes.

---

## 🚀 Setup & Initialization Commands

Execute the following commands in your local workspace terminal:

### 1. Install Prisma & Client dependencies

```bash
npm install @prisma/client zod
npm install -D prisma ts-node
```

### 2. Push Database Schema

To generate tables and compile relationships directly into your Neon PostgreSQL database, run:

```bash
npx prisma db push
```

### 3. Generate Prisma Client Types

To compile TypeScript models and auto-complete properties, run:

```bash
npx prisma generate
```

### 4. Run Seeding Script

To seed standard templates and the default user accounts to your active PostgreSQL instance, execute:

```bash
npx prisma db seed
```

_(Prisma automatically reads the `seed` configuration from `package.json` to execute `ts-node prisma/seed.ts`)_

---

## 🛠 Database Services Usage

You can import service classes directly into Next.js Route Handlers or Server Actions:

### 1. `ResumeService`

```typescript
import { ResumeService } from "@/services/db/resume";

// Fetch paginated resumes matching query filter options
const resumes = await ResumeService.listResumes(userId, {
  page: 1,
  limit: 10,
  q: "Software Engineer",
  sortBy: "updatedAt",
  sortOrder: "desc",
});

// Update or create detailed CV schema atoms in a transaction
const updated = await ResumeService.upsertResume(resumeId, userId, {
  title: "Jane Doe CV",
  summary: "Senior developer...",
  experiences: [
    {
      company: "Tech Inc",
      role: "Developer",
      startDate: "2021",
      endDate: "2023",
      description: "REST APIs",
    },
  ],
});
```

### 2. `AtsService`

```typescript
import { AtsService } from "@/services/db/ats";

// Log ATS scan reports
const report = await AtsService.logAtsReport(resumeId, userId, {
  jobTitle: "React Engineer",
  score: 85,
  details: { missingKeywords: ["GraphQL"] },
});
```

---

## 🌐 API Reference Payload Formats

All API responses follow a standard JSON layout structure:

### Success Response:

```json
{
  "success": true,
  "data": {
    "id": "d62d3a95-5d9c-4613-8d9e-108b3a0e10b1",
    "title": "React Engineer Draft"
  }
}
```

### Validation Error:

```json
{
  "success": false,
  "error": "Validation Error",
  "details": {
    "email": ["Invalid email format"]
  }
}
```

### Standard Exceptions:

```json
{
  "success": false,
  "error": "Unauthorized: User database is empty."
}
```
