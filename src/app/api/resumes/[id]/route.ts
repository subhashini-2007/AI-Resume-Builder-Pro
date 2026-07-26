import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { resumeUpsertSchema } from "@/lib/validation/schemas";
import { ResumeService } from "@/services/db/resume";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUser(request);
    const { id } = await params;

    const resume = await ResumeService.findById(id, userId);
    if (!resume) {
      return handleApiError(new Error("Document not found or access denied."));
    }

    return handleApiSuccess(resume);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUser(request);
    const { id } = await params;
    const body = await request.json();

    const validated = resumeUpsertSchema.parse(body);
    const updated = await ResumeService.upsertResume(id, userId, validated);

    return handleApiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUser(request);
    const { id } = await params;

    await ResumeService.softDelete(id, userId);

    return handleApiSuccess({ message: "Resume deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
