import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { UserService } from "@/services/db/user";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const notifications = await UserService.getUserNotifications(userId);
    return handleApiSuccess(notifications);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const body = await request.json();

    const validated = z.object({ id: z.string().uuid() }).parse(body);
    await UserService.markNotificationRead(validated.id, userId);

    return handleApiSuccess({ message: "Notification marked as read successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
