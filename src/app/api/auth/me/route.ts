import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { UserService } from "@/services/db/user";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const user = await UserService.findById(userId);

    if (!user) {
      return handleApiError(new Error("User profile not found."));
    }

    return handleApiSuccess({
      id: user.id,
      name: user.name,
      email: user.email,
      settings: user.settings,
      subscription: user.subscription,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const body = await request.json();
    const { name, email } = body;

    const data: { name?: string; email?: string } = {};
    if (name) {
      if (name.length < 2) throw new Error("Name must be at least 2 characters");
      data.name = name;
    }
    if (email) {
      if (!email.includes("@")) throw new Error("Invalid email format");
      data.email = email;
    }

    const updated = await UserService.updateUser(userId, data);
    return handleApiSuccess({
      id: updated.id,
      name: updated.name,
      email: updated.email,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
