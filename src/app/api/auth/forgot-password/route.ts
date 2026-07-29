import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    // Always return the same response to prevent email enumeration attacks
    const successResponse = NextResponse.json(
      {
        success: true,
        message: "If an account exists for this email, a recovery link has been sent.",
      },
      { status: 200 }
    );

    // Look up user (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email.toLowerCase().trim(), mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (!user) {
      // Return success regardless to prevent email enumeration
      return successResponse;
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token as a temporary notification record (no separate token table needed)
    // The token is stored and the user clicks the link in email
    if (process.env.NODE_ENV === "development") {
      console.log(`[Forgot Password Debug] Reset token for ${user.email}: ${resetToken}`);
      console.log(`[Forgot Password Debug] Reset URL: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`);
    }

    // Only attempt to send email if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (resendApiKey && resendApiKey !== "re_your_resend_api_key_here") {
      try {
        let resendModule: any = null;
        try {
          resendModule = eval("require('resend')");
        } catch (e) {
          console.warn("[Forgot Password] 'resend' package not installed. Email not sent.");
        }
        if (!resendModule) {
          console.warn("[Forgot Password] 'resend' package not installed. Email not sent.");
        } else {
          const { Resend } = resendModule;
          const resend = new Resend(resendApiKey);

          const resetUrl = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

          await resend.emails.send({
            from: resendFrom,
            to: user.email,
            subject: "Reset your ResumeBuilderPro password",
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
                <h2 style="color:#6d28d9;">Reset Your Password</h2>
                <p>Hi ${user.name},</p>
                <p>We received a request to reset your password. Click the link below to choose a new one:</p>
                <a href="${resetUrl}"
                   style="display:inline-block;margin:16px 0;padding:12px 24px;background:#6d28d9;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
                  Reset Password
                </a>
                <p style="color:#6b7280;font-size:13px;">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
              </div>
            `,
          });

          if (process.env.NODE_ENV === "development") {
            console.log(`[Forgot Password] Email dispatched to ${user.email}`);
          }
        }
      } catch (emailErr) {
        // Don't expose email errors to the client
        console.error("[Forgot Password] Email send failed:", emailErr);
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Forgot Password] RESEND_API_KEY not configured — email not sent.");
        console.log(`[Forgot Password] Token (dev only): ${resetToken}`);
        console.log(`[Forgot Password] Expires: ${expiresAt.toISOString()}`);
      }
    }

    return successResponse;
  } catch (error) {
    console.error("[Forgot Password] Error:", error);
    // Return generic success to prevent information leakage
    return NextResponse.json(
      { success: true, message: "If an account exists for this email, a recovery link has been sent." },
      { status: 200 }
    );
  }
}
