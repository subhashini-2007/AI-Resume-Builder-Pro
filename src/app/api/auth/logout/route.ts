import { handleApiError, handleApiSuccess } from "@/lib/api-response";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearSessionCookie();
    return handleApiSuccess({ message: "Successfully logged out and session cleared." });
  } catch (error) {
    return handleApiError(error);
  }
}
