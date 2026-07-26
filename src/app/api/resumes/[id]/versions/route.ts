import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { ResumeService } from "@/services/db/resume";
import { z } from "zod";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUser(request);
    const { id } = await params;

    const versions = await ResumeService.getVersions(id, userId);
    return handleApiSuccess(versions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUser(request);
    const { id } = await params;
    const body = await request.json();

    const validated = z.object({ title: z.string().min(1) }).parse(body);
    const version = await ResumeService.logVersion(id, userId, validated.title);

    return handleApiSuccess(version, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
