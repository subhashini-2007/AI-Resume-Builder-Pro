import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { clearSessionCookie } from "@/lib/auth/session";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
      .regex(/[0-9]/, "New password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate – extract userId from session cookie
    const userId = await getSessionUser(request);

    // 2. Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || "Validation failed";
      return handleApiError(new Error(`Invalid Request: ${firstError}`));
    }

    const { currentPassword, newPassword } = parsed.data;

    // 3. Fetch the user from the database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return handleApiError(new Error("Unauthorized: User not found"));
    }

    // 4. Verify the current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return handleApiError(new Error("Invalid Request: Current password is incorrect"));
    }

    // 5. Ensure new password differs from the current one
    const isSamePassword = await comparePassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      return handleApiError(
        new Error("Invalid Request: New password must be different from current password")
      );
    }

    // 6. Hash and persist new password
    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // 7. Invalidate session – clear the HTTP-only cookie
    await clearSessionCookie();

    return handleApiSuccess({
      message: "Password updated successfully. Please sign in again.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
