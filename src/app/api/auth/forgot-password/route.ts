import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { handleApiSuccess, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return handleApiSuccess({ message: "Recovery email sent successfully." });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not defined.");
    }

    const hashSlice = user.passwordHash.slice(-10);
    const token = jwt.sign(
      { userId: user.id, email: user.email, hashSlice },
      secret,
      { expiresIn: "15m" }
    );

    // Determine production domain dynamically if NEXT_PUBLIC_APP_URL is not set or points to localhost
    const originHeader = request.headers.get("origin") || request.headers.get("referer");
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl || appUrl.includes("localhost")) {
      if (originHeader) {
        try {
          appUrl = new URL(originHeader).origin;
        } catch {
          appUrl = "https://ai-resume-builder-pro.vercel.app";
        }
      } else {
        appUrl = "https://ai-resume-builder-pro.vercel.app";
      }
    }
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error("Email delivery failed: RESEND_API_KEY environment variable is not defined on Vercel.");
    }

    const emailPayload = {
      from: "AI Resume Builder <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your Workspace Password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hello ${user.name || "there"},</p>
          <p>We received a request to reset your password for your Resume Workspace. Click the button below to choose a new password. This link is valid for 15 minutes.</p>
          <div style="margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">If you did not request a password reset, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8;">Acme Corp, 123 Workspace Way</p>
        </div>
      `,
    };

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resendRes.ok) {
      const errJson = await resendRes.json().catch(() => ({}));
      const errMsg = errJson.message || "Failed to dispatch password recovery email.";
      console.error("Resend API error:", errJson);
      throw new Error(`Email sending failed: ${errMsg}`);
    }

    return handleApiSuccess({ message: "Recovery email sent successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
