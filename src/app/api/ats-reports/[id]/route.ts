import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { AtsService } from "@/services/db/ats";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUser(request);
    const { id } = await params;

    const report = await AtsService.findReportById(id, userId);
    if (!report) {
      return handleApiError(new Error("Report not found or access denied."));
    }

    return handleApiSuccess(report);
  } catch (error) {
    return handleApiError(error);
  }
}
