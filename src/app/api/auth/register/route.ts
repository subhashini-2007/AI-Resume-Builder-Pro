import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess } from "@/lib/api-response";
import { registerSchema } from "@/lib/validation/schemas";
import { UserService } from "@/services/db/user";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // 1. Register user (UserService.registerUser handles duplicate email checks and bcrypt hashing)
    const user = await UserService.registerUser(
      validated.email,
      validated.password,
      validated.name
    );

    // 2. Sign JWT token
    const token = signToken({ userId: user.id, email: user.email });

    // 3. Save HTTP-only cookie
    await setSessionCookie(token);

    // 4. Return safe user details
    return handleApiSuccess(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
