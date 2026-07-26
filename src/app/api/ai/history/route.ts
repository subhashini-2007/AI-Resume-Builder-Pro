import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { AtsService } from "@/services/db/ats";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const history = await AtsService.getAiHistory(userId);
    // Filter history specifically for interview-feedback
    const interviewAttempts = history.filter((h) => h.actionType === "interview-feedback");
    return handleApiSuccess(interviewAttempts);
  } catch (error) {
    return handleApiError(error);
  }
}
