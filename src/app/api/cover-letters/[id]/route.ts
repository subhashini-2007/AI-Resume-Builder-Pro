import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { coverLetterSchema } from "@/lib/validation/schemas";
import { CoverLetterService } from "@/services/db/cover-letter";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUser(request);
    const { id } = await params;

    const letter = await CoverLetterService.findById(id, userId);
    if (!letter) {
      return handleApiError(new Error("Cover letter not found or access denied."));
    }

    return handleApiSuccess(letter);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUser(request);
    const { id } = await params;
    const body = await request.json();

    const validated = coverLetterSchema.partial().parse(body);
    const updated = await CoverLetterService.updateLetter(id, userId, validated);

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

    await CoverLetterService.softDelete(id, userId);

    return handleApiSuccess({ message: "Cover letter deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
