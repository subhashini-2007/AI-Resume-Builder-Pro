import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { settingsUpdateSchema } from "@/lib/validation/schemas";
import { UserService } from "@/services/db/user";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const user = await UserService.findById(userId);
    if (!user) {
      return handleApiError(new Error("User not found"));
    }
    return handleApiSuccess(user.settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const body = await request.json();

    const validated = settingsUpdateSchema.parse(body);
    const updated = await UserService.updateSettings(userId, validated);

    return handleApiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
