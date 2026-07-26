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

    return prisma.$transaction(async (tx) => {
      // 1. Verify ownership
      const existing = await tx.resume.findFirst({
        where: { id, userId, deletedAt: null },
      });

      if (!existing) {
        throw new Error("Resume not found or access denied.");
      }

      // 2. Clear old relational records
      await tx.experience.deleteMany({ where: { resumeId: id } });
      await tx.education.deleteMany({ where: { resumeId: id } });
      await tx.skill.deleteMany({ where: { resumeId: id } });
      await tx.project.deleteMany({ where: { resumeId: id } });
      await tx.certification.deleteMany({ where: { resumeId: id } });
      await tx.language.deleteMany({ where: { resumeId: id } });
      await tx.award.deleteMany({ where: { resumeId: id } });
      await tx.interest.deleteMany({ where: { resumeId: id } });
      await tx.reference.deleteMany({ where: { resumeId: id } });

      // 3. Update main record and write new child arrays
      return tx.resume.update({
        where: { id },
        data: {
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
              startDate: edu.startDate,
              endDate: edu.endDate,
              grade: edu.grade,
              description: edu.description,
              order: edu.order,
            })),
          },
          skills: {
            create: skills.map((s: SkillInput) => ({
              name: s.name,
              level: s.level,
              category: s.category,
              order: s.order,
            })),
          },
          projects: {
            create: projects.map((proj: ProjectInput) => ({
              name: proj.name,
              description: proj.description,
              role: proj.role,
              url: proj.url,
              startDate: proj.startDate,
              endDate: proj.endDate,
              order: proj.order,
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
            create: languages.map((lang: LanguageInput) => ({
              name: lang.name,
              proficiency: lang.proficiency,
              order: lang.order,
            })),
          },
          awards: {
            create: awards.map((aw: AwardInput) => ({
              title: aw.title,
              issuer: aw.issuer,
              date: aw.date,
              description: aw.description,
              order: aw.order,
            })),
          },
          interests: {
            create: interests.map((int: InterestInput) => ({
              name: int.name,
              order: int.order,
            })),
          },
          references: {
            create: references.map((ref: ReferenceInput) => ({
              name: ref.name,
              title: ref.title,
              company: ref.company,
              email: ref.email,
              phone: ref.phone,
              order: ref.order,
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
      });
    });
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
