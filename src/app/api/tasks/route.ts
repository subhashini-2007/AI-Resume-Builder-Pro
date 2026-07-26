import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const tasks = await prisma.userTask.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    });
    return handleApiSuccess(tasks);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const { title, status } = await request.json();

    if (!title || !status) {
      throw new Error("Missing parameters: title and status are required");
    }

    // Update the task status
    const updated = await prisma.userTask.updateMany({
      where: {
        userId,
        title,
      },
      data: {
        status,
      },
    });

    return handleApiSuccess({ updatedCount: updated.count });
  } catch (error) {
    return handleApiError(error);
  }
}
