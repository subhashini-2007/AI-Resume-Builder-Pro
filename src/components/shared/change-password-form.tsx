"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

// ─── Types ─────────────────────────────────────────────────────────────────
interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

// ─── Client-side validation (mirrors server Zod schema) ───────────────────
function validateForm(values: FormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = "Current password is required";
  }

  if (!values.newPassword) {
    errors.newPassword = "New password is required";
  } else if (values.newPassword.length < 8) {
    errors.newPassword = "Must be at least 8 characters";
  } else if (!/[A-Z]/.test(values.newPassword)) {
    errors.newPassword = "Must contain at least one uppercase letter";
  } else if (!/[0-9]/.test(values.newPassword)) {
    errors.newPassword = "Must contain at least one number";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your new password";
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

// ─── Password strength indicator ──────────────────────────────────────────
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

// ─── PasswordInput helper ─────────────────────────────────────────────────
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={id === "currentPassword" ? "current-password" : "new-password"}
        className={`w-full rounded-md border bg-background/50 px-3 py-2 pr-10 text-sm text-foreground transition-colors focus:outline-none ${
          error
            ? "border-destructive focus:border-destructive"
            : "border-border focus:border-primary"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        disabled={disabled}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export function ChangePasswordForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = React.useState<FormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const strength = getPasswordStrength(values.newPassword);

  const set = (field: keyof FormState) => (v: string) => {
    setValues((prev) => ({ ...prev, [field]: v }));
    // Clear field error on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation first
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        // Surface server error to the appropriate field
        const msg: string = json.details || json.error || "Failed to update password";

        if (msg.toLowerCase().includes("current password")) {
          setErrors({ currentPassword: "Current password is incorrect" });
        } else if (msg.toLowerCase().includes("different")) {
          setErrors({
            newPassword: "New password must be different from your current password",
          });
        } else {
          setErrors({ general: msg });
        }
        return;
      }

      // Success – clear localStorage cache, then redirect to login
      setIsSuccess(true);
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_user");
      }

      toast({
        title: "Password Changed",
        description: "Your password has been updated. Please sign in again.",
        variant: "success",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
          <ShieldCheck className="h-6 w-6 text-green-500" />
        </div>
        <p className="text-sm font-semibold text-foreground">Password Updated</p>
        <p className="text-xs text-muted-foreground">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* General error banner */}
      {errors.general && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">{errors.general}</p>
        </div>
      )}

      {/* Current Password */}
      <div className="space-y-1">
        <label
          htmlFor="currentPassword"
          className="text-xs font-semibold text-muted-foreground"
        >
          Current Password
        </label>
        <PasswordInput
          id="currentPassword"
          value={values.currentPassword}
          onChange={set("currentPassword")}
          placeholder="Enter your current password"
          disabled={isSubmitting}
          error={errors.currentPassword}
        />
      </div>

      {/* New Password */}
      <div className="space-y-1">
        <label
          htmlFor="newPassword"
          className="text-xs font-semibold text-muted-foreground"
        >
          New Password
        </label>
        <PasswordInput
          id="newPassword"
          value={values.newPassword}
          onChange={set("newPassword")}
          placeholder="Minimum 8 characters, 1 uppercase, 1 number"
          disabled={isSubmitting}
          error={errors.newPassword}
        />
        {/* Strength indicator */}
        {values.newPassword && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
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
        <label
          htmlFor="confirmPassword"
          className="text-xs font-semibold text-muted-foreground"
        >
          Confirm New Password
        </label>
        <PasswordInput
          id="confirmPassword"
          value={values.confirmPassword}
          onChange={set("confirmPassword")}
          placeholder="Re-enter your new password"
          disabled={isSubmitting}
          error={errors.confirmPassword}
        />
      </div>

      {/* Requirements hint */}
      <ul className="space-y-0.5 text-[10px] text-muted-foreground">
        <li className={values.newPassword.length >= 8 ? "text-green-500" : ""}>
          ✓ At least 8 characters
        </li>
        <li className={/[A-Z]/.test(values.newPassword) ? "text-green-500" : ""}>
          ✓ At least one uppercase letter
        </li>
        <li className={/[0-9]/.test(values.newPassword) ? "text-green-500" : ""}>
          ✓ At least one number
        </li>
      </ul>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Updating Password…
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
