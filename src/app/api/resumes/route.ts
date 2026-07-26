import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { paginationQuerySchema } from "@/lib/validation/schemas";
import { ResumeService } from "@/services/db/resume";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const url = new URL(request.url);
    const queries = {
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      q: url.searchParams.get("q") || undefined,
      status: url.searchParams.get("status") || undefined,
      sortBy: url.searchParams.get("sortBy") || undefined,
      sortOrder: url.searchParams.get("sortOrder") || undefined,
    };

    const validatedQueries = paginationQuerySchema.parse(queries);

    const result = await ResumeService.listResumes(userId, {
      page: validatedQueries.page,
      limit: validatedQueries.limit,
      q: validatedQueries.q,
      status: validatedQueries.status,
      sortBy: validatedQueries.sortBy,
      sortOrder: validatedQueries.sortOrder,
    });

    return handleApiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const draft = await ResumeService.createEmptyDraft(userId);
    return handleApiSuccess(draft, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
