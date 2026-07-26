import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session_token")?.value;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isApiProtectedRoute =
    pathname.startsWith("/api/resumes") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/cover-letters") ||
    pathname.startsWith("/api/ats-reports") ||
    pathname.startsWith("/api/notifications");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if ((isDashboardRoute || isApiProtectedRoute) && !token) {
    if (isApiProtectedRoute) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing session token" },
        { status: 401 }
      );
    }
    // Redirect to login if accessing dashboard without a token
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    // Redirect to dashboard if logged in and trying to access auth pages
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Intercept dashboard, auth, and protected API routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/api/resumes/:path*",
    "/api/settings/:path*",
    "/api/cover-letters/:path*",
    "/api/ats-reports/:path*",
    "/api/notifications/:path*",
  ],
};
