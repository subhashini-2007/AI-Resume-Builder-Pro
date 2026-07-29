"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

// ─── Zod Client Validation Schema ──────────────────────────────────────────
const clientChangePasswordSchema = z
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

type FormValues = z.infer<typeof clientChangePasswordSchema>;

// ─── Password Strength Calculator ─────────────────────────────────────────
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

export function ChangePasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(clientChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword", "");
  const strength = getPasswordStrength(newPasswordValue);

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errMsg = json.details || json.error || "Failed to update password";
        
        if (errMsg.toLowerCase().includes("current password")) {
          setError("currentPassword", { message: "Current password is incorrect" });
        } else if (errMsg.toLowerCase().includes("different")) {
          setError("newPassword", { message: "New password must be different from current password" });
        } else {
          setError("root", { message: errMsg });
        }
        return;
      }

      setIsSuccess(true);

      // Force Logout cleanup on client
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_user");
        localStorage.clear();
        sessionStorage.clear();
        document.cookie = "session_token=; path=/; max-age=0; SameSite=Lax";
      }

      toast({
        title: "Password Updated",
        description: "Your password has been changed. Please sign in again.",
        variant: "success",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("root", { message: "Network error occurred. Please try again." });
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center animate-in fade-in duration-200">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
          <ShieldCheck className="h-6 w-6 text-green-500" />
        </div>
        <p className="text-sm font-semibold text-foreground">Password Updated</p>
        <p className="text-xs text-muted-foreground">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {errors.root && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 animate-in slide-in-from-top duration-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">{errors.root.message}</p>
        </div>
      )}

      {/* Current Password */}
      <div className="space-y-1">
        <label htmlFor="currentPassword" className="text-xs font-semibold text-muted-foreground">
          Current Password
        </label>
        <div className="relative">
          <input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            disabled={isSubmitting}
            placeholder="Enter your current password"
            autoComplete="current-password"
            className={`w-full rounded-md border bg-background/50 px-3 py-2 pr-10 text-sm text-foreground transition-colors focus:outline-none ${
              errors.currentPassword ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
            } disabled:cursor-not-allowed disabled:opacity-50`}
            {...register("currentPassword")}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((s) => !s)}
            disabled={isSubmitting}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-1">
        <label htmlFor="newPassword" className="text-xs font-semibold text-muted-foreground">
          New Password
        </label>
        <div className="relative">
          <input
            id="newPassword"
            type={showNew ? "text" : "password"}
            disabled={isSubmitting}
            placeholder="Min 8 chars, 1 uppercase, 1 special character"
            autoComplete="new-password"
            className={`w-full rounded-md border bg-background/50 px-3 py-2 pr-10 text-sm text-foreground transition-colors focus:outline-none ${
              errors.newPassword ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
            } disabled:cursor-not-allowed disabled:opacity-50`}
            {...register("newPassword")}
          />
          <button
            type="button"
            onClick={() => setShowNew((s) => !s)}
            disabled={isSubmitting}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {errors.newPassword.message}
          </p>
        )}

        {/* Strength indicator */}
        {newPasswordValue && (
          <div className="mt-2 space-y-1 animate-in fade-in duration-200">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    strength.score >= i ? strength.color : "bg-border"
                  }`}
                />
              ))}
            </div>
            {strength.label && (
              <p className="text-[10px] text-muted-foreground">
                Strength:{" "}
                <span
                  className={
                    strength.score >= 4
                      ? "text-green-500"
                      : strength.score >= 3
                        ? "text-yellow-500"
                        : strength.score >= 2
                          ? "text-orange-500"
                          : "text-destructive"
                  }
                >
                  {strength.label}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            disabled={isSubmitting}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            className={`w-full rounded-md border bg-background/50 px-3 py-2 pr-10 text-sm text-foreground transition-colors focus:outline-none ${
              errors.confirmPassword ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
            } disabled:cursor-not-allowed disabled:opacity-50`}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            disabled={isSubmitting}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Requirements helper list */}
      <ul className="space-y-1 text-[10px] text-muted-foreground">
        <li className={newPasswordValue.length >= 8 ? "text-green-500 font-medium" : ""}>
          {newPasswordValue.length >= 8 ? "✓" : "•"} At least 8 characters
        </li>
        <li className={/[A-Z]/.test(newPasswordValue) ? "text-green-500 font-medium" : ""}>
          {/[A-Z]/.test(newPasswordValue) ? "✓" : "•"} At least one uppercase letter
        </li>
        <li className={/[a-z]/.test(newPasswordValue) ? "text-green-500 font-medium" : ""}>
          {/[a-z]/.test(newPasswordValue) ? "✓" : "•"} At least one lowercase letter
        </li>
        <li className={/[0-9]/.test(newPasswordValue) ? "text-green-500 font-medium" : ""}>
          {/[0-9]/.test(newPasswordValue) ? "✓" : "•"} At least one number
        </li>
        <li className={/[^A-Za-z0-9]/.test(newPasswordValue) ? "text-green-500 font-medium" : ""}>
          {/[^A-Za-z0-9]/.test(newPasswordValue) ? "✓" : "•"} At least one special character
        </li>
      </ul>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Updating Password...
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Update Password
          </>
        )}
      </Button>
    </form>
  );
}
