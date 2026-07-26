import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyToken } from "@/lib/auth/jwt";

export function handleApiError(error: unknown) {
  console.error("API Error Logged:", error);
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation Error",
        details: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const message = error instanceof Error ? error.message : "Internal Server Error";
  let status = 500;
  if (message.startsWith("Unauthorized") || message.toLowerCase().includes("credentials")) {
    status = 401;
  } else if (message.toLowerCase().includes("not found")) {
    status = 404;
  } else if (
    message.toLowerCase().includes("already exists") ||
    message.toLowerCase().includes("invalid") ||
    message.toLowerCase().includes("validation")
  ) {
    status = 400;
  }
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export function handleApiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
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
