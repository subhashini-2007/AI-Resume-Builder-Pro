import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyToken } from "@/lib/auth/jwt";

export function handleApiError(error: unknown) {
  console.error("[API ERR] Error encountered:", error);

  if (error instanceof ZodError) {
    const fieldErrors = error.flatten().fieldErrors;
    console.warn("[Validation Status] Failed:", JSON.stringify(fieldErrors));
    const firstIssue = error.issues[0];
    const userFriendlyMessage = firstIssue
      ? firstIssue.message
      : "Validation Error";
    return NextResponse.json(
      {
        success: false,
        message: userFriendlyMessage,
        error: userFriendlyMessage,
        errors: Object.values(fieldErrors).flat(),
        details: fieldErrors,
      },
      { status: 400 }
    );
  }

  const rawMessage = error instanceof Error ? error.message : String(error || "Internal Server Error");
  let status = 500;
  let errorSummary = "Internal Server Error";
  let details: string | undefined = rawMessage;

  const isPrismaError =
    rawMessage.includes("PrismaClient") ||
    rawMessage.includes("prisma") ||
    rawMessage.includes("Environment variable not found: DATABASE_URL") ||
    rawMessage.includes("Can't reach database server");



  if (isPrismaError) {
    console.error("[DB ERR] Prisma/Database failure:", rawMessage);
    errorSummary = "Database Connection Error";
    details = process.env.NODE_ENV === "production"
      ? "Unable to connect to PostgreSQL database. Verify DATABASE_URL in Vercel configuration."
      : rawMessage;
  } else if (rawMessage.startsWith("Unauthorized") || rawMessage.toLowerCase().includes("credentials")) {
    console.warn("[Auth Error]:", rawMessage);
    status = 401;
    errorSummary = rawMessage;
  } else {
    status = 400;
    errorSummary = rawMessage;
  }

  const response = NextResponse.json(
    {
      success: false,
      message: errorSummary,
      error: errorSummary,
      errors: [details || errorSummary],
      details: details || rawMessage,
    },
    { status }
  );

  if (status === 401) {
    response.cookies.set("session_token", "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}

export function handleApiSuccess<T>(data: T, status = 200, message = "Success") {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

/**
 * Parses and verifies the JWT session token from request cookies.
 */
export async function getSessionUser(request: Request): Promise<string> {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session_token="));

  if (!tokenCookie) {
    throw new Error("Unauthorized: No session token found");
  }

  const token = tokenCookie.split("=").slice(1).join("=");
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    throw new Error("Unauthorized: Invalid or expired session token");
  }

  return decoded.userId;
}
