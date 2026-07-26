import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { coverLetterSchema } from "@/lib/validation/schemas";
import { CoverLetterService } from "@/services/db/cover-letter";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const letters = await CoverLetterService.listLetters(userId);
    return handleApiSuccess(letters);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const body = await request.json();

    const validated = coverLetterSchema.parse(body);
    const letter = await CoverLetterService.createLetter(userId, validated);

    return handleApiSuccess(letter, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
