import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { clearSessionCookie } from "@/lib/auth/session";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// In-memory rate limiting map: ip -> { attempts, resetTime }
const rateLimitMap = new Map<string, { attempts: number; resetTime: number }>();

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
      .regex(/[a-z]/, "New password must contain at least one lowercase letter")
      .regex(/[0-9]/, "New password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "New password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting (Max 5 attempts per 15 minutes)
    const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
    const now = Date.now();
    const rateLimit = rateLimitMap.get(ip);

    if (rateLimit && now < rateLimit.resetTime) {
      if (rateLimit.attempts >= 5) {
        return handleApiError(
          new Error("Unauthorized: Too many password change attempts. Please try again in 15 minutes.")
        );
      }
      rateLimit.attempts += 1;
    } else {
      rateLimitMap.set(ip, { attempts: 1, resetTime: now + 15 * 60 * 1000 });
    }

    // 2. Authenticate – extract userId from session cookie
    const userId = await getSessionUser(request);

    // 3. Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || "Validation failed";
      return handleApiError(new Error(`Invalid Request: ${firstError}`));
    }

    const { currentPassword, newPassword } = parsed.data;

    // 4. Fetch the user from the database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return handleApiError(new Error("Unauthorized: User not found"));
    }

    // 5. Verify the current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return handleApiError(new Error("Invalid Request: Current password is incorrect"));
    }

    // 6. Prevent password reuse (New password must be different from current password)
    const isSamePassword = await comparePassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      return handleApiError(
        new Error("Invalid Request: New password must be different from current password")
      );
    }

    // 7. Hash and persist new password (uses bcrypt cost factor 12)
    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // 8. Invalidate session – clear the HTTP-only cookie
    await clearSessionCookie();

    return handleApiSuccess({
      message: "Password updated successfully. Please sign in again.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
