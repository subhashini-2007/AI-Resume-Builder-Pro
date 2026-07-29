"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token || !email) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const json = await res.json();

      if (json.success) {
        setIsSuccess(true);
        toast({
          title: "Password Reset",
          description: "Your password has been updated. You can now sign in.",
          variant: "success",
        });
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(json.error || "Failed to reset password. Please request a new link.");
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="relative flex min-h-[calc(100vh-16rem)] items-center justify-center overflow-hidden px-4 py-12">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />

        <div className="w-full max-w-md">
          <Card className="glassmorphism border-border/50">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-violet-500 text-primary-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Set New Password</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a new password for your account
              </p>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">Password Updated!</h3>
                  <p className="mx-auto mb-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
                    Your password has been reset. Redirecting you to sign in…
                  </p>
                </div>
              ) : (
                <>
                  {!token && (
                    <div className="mb-4 flex items-start gap-2 rounded-md bg-amber-500/10 p-3 text-xs text-amber-600">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        Invalid reset link. Please{" "}
                        <Link href="/forgot-password" className="font-semibold underline">
                          request a new one
                        </Link>
                        .
                      </span>
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="password"
                        className="text-xs font-semibold text-muted-foreground"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Minimum 6 characters"
                          className="w-full rounded-md border border-border bg-background/50 py-2 pl-10 pr-10 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={!token || isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="confirmPassword"
                        className="text-xs font-semibold text-muted-foreground"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Re-enter your new password"
                          className="w-full rounded-md border border-border bg-background/50 py-2 pl-10 pr-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={!token || isLoading}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="mt-4 w-full"
                      disabled={isLoading || !token}
                    >
                      {isLoading ? "Updating password..." : "Reset Password"}
                    </Button>
                  </form>
                </>
              )}

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
