import { prisma } from "@/lib/prisma";

export class CoverLetterService {
  static async listLetters(userId: string) {
    return prisma.coverLetter.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async findById(id: string, userId: string) {
    return prisma.coverLetter.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });
  }

  static async createLetter(
    userId: string,
    data: { jobTitle: string; company: string; body: string }
  ) {
    return prisma.coverLetter.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  static async updateLetter(
    id: string,
    userId: string,
    data: { jobTitle?: string; company?: string; body?: string }
  ) {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error("Cover letter not found or access denied.");
    }

    return prisma.coverLetter.update({
      where: { id },
      data,
    });
  }

  static async softDelete(id: string, userId: string) {
    return prisma.coverLetter.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }
}
