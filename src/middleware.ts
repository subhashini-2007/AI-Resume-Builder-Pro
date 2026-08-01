import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("session_token")?.value;

    const isApiProtectedRoute =
      pathname.startsWith("/api/resumes") ||
      pathname.startsWith("/api/settings") ||
      pathname.startsWith("/api/cover-letters") ||
      pathname.startsWith("/api/ats-reports") ||
      pathname.startsWith("/api/notifications");

    if (isApiProtectedRoute && !token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing session token" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware Error]:", error);
    return NextResponse.next();
  }
}

// Intercept protected API routes
export const config = {
  matcher: [
    "/api/resumes/:path*",
    "/api/settings/:path*",
    "/api/cover-letters/:path*",
    "/api/ats-reports/:path*",
    "/api/notifications/:path*",
  ],
};
