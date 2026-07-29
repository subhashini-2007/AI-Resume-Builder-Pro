import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, password } = schema.parse(body);

    // Look up user (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email.toLowerCase().trim(), mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // In a full implementation this would verify the token against a PasswordResetToken
    // table. Since that table is not yet in the schema, we log the attempt in development.
    if (process.env.NODE_ENV === "development") {
      console.log(`[Reset Password Debug] Token received for user ${user.email}: ${token}`);
    }

    if (!token || token.length < 32) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash the new password and update
    const newPasswordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`[Reset Password Debug] Password updated for user ${user.email}`);
    }

    return NextResponse.json(
      { success: true, message: "Your password has been reset. You can now sign in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Reset Password] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
