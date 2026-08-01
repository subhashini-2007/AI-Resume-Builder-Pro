import { NextRequest, NextResponse } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { paginationQuerySchema } from "@/lib/validation/schemas";
import { ResumeService } from "@/services/db/resume";

export const dynamic = "force-dynamic";

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
  } catch (error: any) {
    console.error("=== DIAGNOSTIC RESUME CREATE ERROR ===");
    console.error("Error Code:", error?.code || "N/A");
    console.error("Error Message:", error?.message || "N/A");
    console.error("Stack Trace:", error?.stack || "N/A");
    console.error("Meta:", error?.meta ? JSON.stringify(error.meta) : "N/A");
    console.error("======================================");

    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          success: false,
          error: error?.message || "Failed to create empty draft",
          code: error?.code,
          meta: error?.meta,
          stack: error?.stack,
        },
        { status: 500 }
      );
    }
    return handleApiError(error);
  }
}
