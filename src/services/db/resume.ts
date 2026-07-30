import { prisma } from "@/lib/prisma";

import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { resumeUpsertSchema } from "@/lib/validation/schemas";

interface ExperienceInput {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrent?: boolean;
  location?: string;
  order?: number;
}
interface EducationInput {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate: string;
  grade?: string;
  description?: string;
  order?: number;
}
interface SkillInput {
  name: string;
  level?: string;
  category?: string;
  order?: number;
}
interface ProjectInput {
  name: string;
  description: string;
  role?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  projectType?: string;
  duration?: string;
  technologies?: string;
  responsibilities?: string;
  keyFeatures?: string[];
  achievements?: string[];
  githubUrl?: string;
  liveUrl?: string;
  documentationUrl?: string;
  teamSize?: string;
  clientName?: string;
  status?: string;
  order?: number;
}
interface CertificationInput {
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  url?: string;
  order?: number;
}
interface LanguageInput {
  name: string;
  proficiency?: string;
  order?: number;
}
interface AwardInput {
  title: string;
  issuer: string;
  date: string;
  description?: string;
  order?: number;
}
interface InterestInput {
  name: string;
  order?: number;
}
interface ReferenceInput {
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  order?: number;
}

export interface ResumeQueryOptions {
  page: number;
  limit: number;
  q?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sortBy: string;
  sortOrder: "asc" | "desc";
}

type ResumeUpsertInput = z.infer<typeof resumeUpsertSchema>;

const ALLOWED_SORT_FIELDS = ["updatedAt", "createdAt", "title", "status"];

export class ResumeService {
  static async listResumes(userId: string, options: ResumeQueryOptions) {
    const { page, limit, q, status, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
      throw new Error("Unauthorized: Invalid sortBy parameter");
    }

    const where: Prisma.ResumeWhereInput = {
      userId,
      deletedAt: null,
    };

    if (q) {
      where.title = {
        contains: q,
        mode: "insensitive",
      };
    }

    if (status) {
      where.status = status;
    }

    const [total, items] = await prisma.$transaction([
      prisma.resume.count({ where }),
      prisma.resume.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          title: true,
          fullName: true,
          summary: true,
          selectedTemplate: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { versions: true, atsReports: true },
          },
          atsReports: {
            select: {
              id: true,
              score: true,
              jobTitle: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  static async findById(id: string, userId: string) {
    return prisma.resume.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        experiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } },
        languages: { orderBy: { order: "asc" } },
        awards: { orderBy: { order: "asc" } },
        interests: { orderBy: { order: "asc" } },
        references: { orderBy: { order: "asc" } },
        versions: {
          select: { id: true, title: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
        atsReports: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  static async createEmptyDraft(userId: string) {
    return prisma.resume.create({
      data: {
        userId,
        title: "New Resume Draft",
        summary: "",
        selectedTemplate: "ats-classic",
        status: "DRAFT",
      },
    });
  }

  static async upsertResume(id: string, userId: string, data: ResumeUpsertInput) {
    // Extract nested arrays to handle in a transaction block
    const {
      experiences = [],
      educations = [],
      skills = [],
      projects = [],
      certifications = [],
      languages = [],
      awards = [],
      interests = [],
      references = [],
      title,
      summary,
      fullName,
      phone,
      email,
      location,
      website,
      avatar,
      selectedTemplate,
      status,
    } = data;

    // 1. Verify ownership
    const existing = await prisma.resume.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new Error("Resume not found or access denied.");
    }

    // 2. Run delete and update in a sequential batch transaction
    const [, , , , , , , , , updatedResume] = await prisma.$transaction([
      prisma.experience.deleteMany({ where: { resumeId: id } }),
      prisma.education.deleteMany({ where: { resumeId: id } }),
      prisma.skill.deleteMany({ where: { resumeId: id } }),
      prisma.project.deleteMany({ where: { resumeId: id } }),
      prisma.certification.deleteMany({ where: { resumeId: id } }),
      prisma.language.deleteMany({ where: { resumeId: id } }),
      prisma.award.deleteMany({ where: { resumeId: id } }),
      prisma.interest.deleteMany({ where: { resumeId: id } }),
      prisma.reference.deleteMany({ where: { resumeId: id } }),
      prisma.resume.update({
        where: { id },
        data: {
          title,
          summary,
          fullName,
          phone,
          email,
          location,
          website,
          linkedinUrl: data.linkedinUrl || "",
          githubUrl: data.githubUrl || "",
          portfolioUrl: data.portfolioUrl || "",
          leetcodeUrl: data.leetcodeUrl || "",
          hackerrankUrl: data.hackerrankUrl || "",
          kaggleUrl: data.kaggleUrl || "",
          mediumUrl: data.mediumUrl || "",
          stackoverflowUrl: data.stackoverflowUrl || "",
          behanceUrl: data.behanceUrl || "",
          dribbbleUrl: data.dribbbleUrl || "",
          twitterUrl: data.twitterUrl || "",
          youtubeUrl: data.youtubeUrl || "",
          devtoUrl: data.devtoUrl || "",
          researchgateUrl: data.researchgateUrl || "",
          orcidUrl: data.orcidUrl || "",
          googleScholarUrl: data.googleScholarUrl || "",
          otherLinkLabel: data.otherLinkLabel || "",
          otherLinkUrl: data.otherLinkUrl || "",
          avatar,
          selectedTemplate,
          status,
          experiences: {
            create: experiences.map((exp: ExperienceInput) => ({
              company: exp.company,
              role: exp.role,
              startDate: exp.startDate,
              endDate: exp.endDate,
              description: exp.description,
              isCurrent: exp.isCurrent,
              location: exp.location,
              order: exp.order,
            })),
          },
          educations: {
            create: educations.map((edu: EducationInput) => ({
              school: edu.school,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy,
              grade: edu.grade,
              startDate: edu.startDate,
              endDate: edu.endDate,
              order: edu.order,
            })),
          },
          skills: {
            create: skills.map((s: SkillInput) => ({
              name: s.name,
              order: s.order,
            })),
          },
          projects: {
            create: projects.map((p: ProjectInput) => ({
              name: p.name,
              description: p.description,
              role: p.role,
              url: p.url,
              startDate: p.startDate,
              endDate: p.endDate,
              projectType: p.projectType,
              duration: p.duration,
              technologies: p.technologies,
              responsibilities: p.responsibilities,
              keyFeatures: p.keyFeatures,
              achievements: p.achievements,
              githubUrl: p.githubUrl,
              liveUrl: p.liveUrl,
              documentationUrl: p.documentationUrl,
              teamSize: p.teamSize,
              clientName: p.clientName,
              status: p.status,
              order: p.order,
            })),
          },
          certifications: {
            create: certifications.map((c: CertificationInput) => ({
              name: c.name,
              issuer: c.issuer,
              issueDate: c.issueDate,
              expiryDate: c.expiryDate,
              url: c.url,
              order: c.order,
            })),
          },
          languages: {
            create: languages.map((l: LanguageInput) => ({
              name: l.name,
              proficiency: l.proficiency,
              order: l.order,
            })),
          },
          awards: {
            create: awards.map((a: AwardInput) => ({
              title: a.title,
              issuer: a.issuer,
              date: a.date,
              description: a.description,
              order: a.order,
            })),
          },
          interests: {
            create: interests.map((i: InterestInput) => ({
              name: i.name,
              order: i.order,
            })),
          },
          references: {
            create: references.map((r: ReferenceInput) => ({
              name: r.name,
              title: r.title,
              company: r.company,
              email: r.email,
              phone: r.phone,
              order: r.order,
            })),
          },
        },
        include: {
          experiences: true,
          educations: true,
          skills: true,
          projects: true,
          certifications: true,
          languages: true,
          awards: true,
          interests: true,
          references: true,
        },
      }),
    ]);

    return updatedResume;
  }

  static async softDelete(id: string, userId: string) {
    return prisma.resume.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }

  // Version Delta Snapshots
  static async logVersion(resumeId: string, userId: string, title: string) {
    const resume = await this.findById(resumeId, userId);
    if (!resume) throw new Error("Resume not found");

    const latest = await prisma.resumeVersion.findFirst({
      where: { resumeId },
      orderBy: { createdAt: "desc" },
    });

    if (latest) {
      const cleanData = (obj: unknown) => {
        const copy = JSON.parse(JSON.stringify(obj)) as Record<string, unknown>;
        delete copy.id;
        delete copy.createdAt;
        delete copy.updatedAt;
        delete copy.versions;
        delete copy.atsReports;
        
        const cleanArr = (arr: unknown) => {
          if (!Array.isArray(arr)) return;
          arr.forEach((item: unknown) => {
            if (item && typeof item === "object") {
              const i = item as Record<string, unknown>;
              delete i.id;
              delete i.createdAt;
              delete i.updatedAt;
              delete i.resumeId;
            }
          });
        };

        if (copy.experiences) cleanArr(copy.experiences);
        if (copy.educations) cleanArr(copy.educations);
        if (copy.skills) cleanArr(copy.skills);
        if (copy.projects) cleanArr(copy.projects);
        if (copy.certifications) cleanArr(copy.certifications);
        if (copy.languages) cleanArr(copy.languages);
        if (copy.awards) cleanArr(copy.awards);
        if (copy.interests) cleanArr(copy.interests);
        if (copy.references) cleanArr(copy.references);
        
        return JSON.stringify(copy);
      };

      if (cleanData(latest.data) === cleanData(resume)) {
        throw new Error("No changes detected since the last saved version.");
      }
    }

    return prisma.resumeVersion.create({
      data: {
        resumeId,
        title,
        data: resume as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async getVersions(resumeId: string, userId: string) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId, deletedAt: null },
    });
    if (!resume) throw new Error("Resume not found or access denied.");

    return prisma.resumeVersion.findMany({
      where: { resumeId },
      orderBy: { createdAt: "desc" },
    });
  }
}
