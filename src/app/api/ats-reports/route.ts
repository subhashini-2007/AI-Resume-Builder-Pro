import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { atsReportSchema } from "@/lib/validation/schemas";
import { AtsService } from "@/services/db/ats";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const url = new URL(request.url);
    const resumeId = url.searchParams.get("resumeId");

    if (!resumeId) {
      return handleApiError(new Error("Missing query parameter: resumeId"));
    }

    const validatedResumeId = z.string().uuid().parse(resumeId);
    const reports = await AtsService.getReportsForResume(validatedResumeId, userId);

    return handleApiSuccess(reports);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const body = await request.json();

    const schema = atsReportSchema.extend({
      resumeId: z.string().uuid(),
    });

    const validated = schema.parse(body);
    const { resumeId, ...reportData } = validated;

    const report = await AtsService.logAtsReport(resumeId, userId, reportData);

    return handleApiSuccess(report, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
