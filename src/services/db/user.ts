import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export class UserService {
  static async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        settings: true,
        subscription: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        settings: true,
        subscription: true,
      },
    });
  }

  static async registerUser(email: string, passwordPlain: string, name: string) {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new Error("A user with this email address already exists.");
    }

    const passwordHash = await hashPassword(passwordPlain);

    return prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        settings: {
          create: {
            theme: "system",
            emailNotifications: true,
          },
        },
        subscription: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
          },
        },
        tasks: {
          create: [
            { title: "Core Profile Foundation", status: "Completed", order: 0 },
            { title: "AI Keyword Alignment", status: "In Progress", order: 1 },
            { title: "Cover Letter Tailoring", status: "Upcoming", order: 2 },
            { title: "Interview Confidence Check", status: "Upcoming", order: 3 },
          ],
        },
      },
      include: {
        settings: true,
        subscription: true,
      },
    });
  }

  static async updateSettings(
    userId: string,
    data: { theme?: string; emailNotifications?: boolean }
  ) {
    return prisma.userSettings.update({
      where: { userId },
      data,
    });
  }

  static async updateUser(id: string, data: { name?: string; email?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async markNotificationRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }
}
