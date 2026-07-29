import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess } from "@/lib/api-response";
import { loginSchema } from "@/lib/validation/schemas";
import { UserService } from "@/services/db/user";
import { comparePassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    // 1. Fetch user by email (case-insensitive, normalised to lowercase)
    const user = await UserService.findByEmail(validated.email);

    if (!user) {
      throw new Error("Unauthorized: Invalid email or password credentials.");
    }

    // 2. Compare plaintext password against stored bcrypt hash
    const isPasswordValid = await comparePassword(validated.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Unauthorized: Invalid email or password credentials.");
    }

    // 3. Sign JWT token
    const token = signToken({ userId: user.id, email: user.email });

    // 4. Save HTTP-only session cookie
    await setSessionCookie(token);

    // 5. Return user details safely
    return handleApiSuccess({
      id: user.id,
      email: user.email,
      name: user.name,
      settings: user.settings,
      subscription: user.subscription,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
