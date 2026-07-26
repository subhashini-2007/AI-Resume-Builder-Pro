import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class AtsService {
  static async logAtsReport(
    resumeId: string,
    userId: string,
    data: { jobTitle: string; score: number; details: Prisma.InputJsonValue }
  ) {
    // 1. Verify owner
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId, deletedAt: null },
    });
    if (!resume) {
      throw new Error("Resume not found or access denied.");
    }

    return prisma.aTSReport.create({
      data: {
        resumeId,
        ...data,
      },
    });
  }

  static async getReportsForResume(resumeId: string, userId: string) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId, deletedAt: null },
    });
    if (!resume) {
      throw new Error("Resume not found or access denied.");
    }

    return prisma.aTSReport.findMany({
      where: { resumeId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findReportById(id: string, userId: string) {
    return prisma.aTSReport.findFirst({
      where: {
        id,
        resume: {
          userId,
          deletedAt: null,
        },
      },
      include: {
        resume: true,
      },
    });
  }

  // AI Auditing logs
  static async logAiHistory(
    userId: string,
    actionType: string,
    prompt: string,
    response: string,
    creditsUsed = 1
  ) {
    return prisma.aIHistory.create({
      data: {
        userId,
        actionType,
        prompt,
        response,
        creditsUsed,
      },
    });
  }

  static async getAiHistory(userId: string) {
    return prisma.aIHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
