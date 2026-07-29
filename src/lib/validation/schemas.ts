import { z } from "zod";

// Pagination, search, filter, and sort queries
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  q: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  sortBy: z.string().default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Authentication Schemas
export const registerSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    name: z.string().min(2, "Name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Resume nested sub-schemas
export const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().default(""),
  role: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  description: z.string().default(""),
  isCurrent: z.boolean().default(false),
  location: z.string().default(""),
  order: z.number().int().default(0),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  school: z.string().default(""),
  degree: z.string().default(""),
  fieldOfStudy: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  grade: z.string().default(""),
  description: z.string().default(""),
  order: z.number().int().default(0),
});

export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().default(""),
  level: z.string().default("Intermediate"),
  category: z.string().default(""),
  order: z.number().int().default(0),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().default(""),
  description: z.string().default(""),
  role: z.string().default(""),
  url: z.string().url().or(z.literal("")).default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  projectType: z.enum(["Academic", "Personal", "Internship", "Freelance", "Open Source"]).default("Personal"),
  duration: z.string().default(""),
  technologies: z.string().default(""),
  responsibilities: z.string().default(""),
  keyFeatures: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  githubUrl: z.string().url().or(z.literal("")).default(""),
  liveUrl: z.string().url().or(z.literal("")).default(""),
  documentationUrl: z.string().url().or(z.literal("")).default(""),
  teamSize: z.string().default(""),
  clientName: z.string().default(""),
  status: z.enum(["Completed", "Ongoing"]).default("Completed"),
  order: z.number().int().default(0),
});

export const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  issueDate: z.string().default(""),
  expiryDate: z.string().default(""),
  url: z.string().url().or(z.literal("")).default(""),
  order: z.number().int().default(0),
});

export const languageSchema = z.object({
  id: z.string().optional(),
  name: z.string().default(""),
  proficiency: z.string().default("Full Professional"),
  order: z.number().int().default(0),
});

export const awardSchema = z.object({
  id: z.string().optional(),
  title: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  description: z.string().default(""),
  order: z.number().int().default(0),
});

export const interestSchema = z.object({
  id: z.string().optional(),
  name: z.string().default(""),
  order: z.number().int().default(0),
});

export const referenceSchema = z.object({
  id: z.string().optional(),
  name: z.string().default(""),
  title: z.string().default(""),
  company: z.string().default(""),
  email: z.string().email().or(z.literal("")).default(""),
  phone: z.string().default(""),
  order: z.number().int().default(0),
});

// Resume Master Schema
export const resumeUpsertSchema = z.object({
  title: z.string().min(1, "Resume title is required"),
  summary: z.string().default(""),
  fullName: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  location: z.string().default(""),
  website: z.string().default(""),
  linkedinUrl: z.string().url().or(z.literal("")).default(""),
  githubUrl: z.string().url().or(z.literal("")).default(""),
  portfolioUrl: z.string().url().or(z.literal("")).default(""),
  leetcodeUrl: z.string().url().or(z.literal("")).default(""),
  hackerrankUrl: z.string().url().or(z.literal("")).default(""),
  kaggleUrl: z.string().url().or(z.literal("")).default(""),
  mediumUrl: z.string().url().or(z.literal("")).default(""),
  stackoverflowUrl: z.string().url().or(z.literal("")).default(""),
  behanceUrl: z.string().url().or(z.literal("")).default(""),
  dribbbleUrl: z.string().url().or(z.literal("")).default(""),
  twitterUrl: z.string().url().or(z.literal("")).default(""),
  youtubeUrl: z.string().url().or(z.literal("")).default(""),
  devtoUrl: z.string().url().or(z.literal("")).default(""),
  researchgateUrl: z.string().url().or(z.literal("")).default(""),
  orcidUrl: z.string().url().or(z.literal("")).default(""),
  googleScholarUrl: z.string().url().or(z.literal("")).default(""),
  otherLinkLabel: z.string().default(""),
  otherLinkUrl: z.string().url().or(z.literal("")).default(""),
  avatar: z.string().default(""),
  selectedTemplate: z.string().default("ats-classic"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),

  experiences: z.array(experienceSchema).optional(),
  educations: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  languages: z.array(languageSchema).optional(),
  awards: z.array(awardSchema).optional(),
  interests: z.array(interestSchema).optional(),
  references: z.array(referenceSchema).optional(),
});

// Cover Letter Schema
export const coverLetterSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  body: z.string().min(1, "Letter content is required"),
});

// ATS score checker report Schema
export const atsReportSchema = z.object({
  jobTitle: z.string().min(1, "Target job title is required"),
  score: z.number().int().min(0).max(100),
  details: z.record(z.any()), // JSON properties map
});

// Settings Schema
export const settingsUpdateSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailNotifications: z.boolean().optional(),
});
