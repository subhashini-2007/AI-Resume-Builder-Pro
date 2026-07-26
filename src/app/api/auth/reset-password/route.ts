import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { hashPassword } from "@/lib/auth/password";
import { handleApiSuccess, handleApiError } from "@/lib/api-response";
import { z } from "zod";

interface ResetPasswordTokenPayload {
  userId: string;
  email: string;
  hashSlice: string;
}

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const secret = process.env.JWT_SECRET || "default_production_jwt_secret_key_32_chars";

    let decoded: ResetPasswordTokenPayload;
    try {
      decoded = jwt.verify(token, secret) as unknown as ResetPasswordTokenPayload;
    } catch {
      throw new Error("Invalid or expired reset token.");
    }

    if (!decoded || !decoded.userId || !decoded.hashSlice) {
      throw new Error("Invalid token payload structure.");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error("User associated with this token does not exist.");
    }

    if (user.passwordHash.slice(-10) !== decoded.hashSlice) {
      throw new Error("This reset link has already been used.");
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return handleApiSuccess({ message: "Password updated successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
