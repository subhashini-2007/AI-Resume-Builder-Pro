"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Lock, Sparkles, RefreshCw } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully reset. Redirecting to login...",
          variant: "success",
        });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setError(json.error || "Failed to reset password.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader className="pb-4 text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-violet-500 text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
        <CardDescription>Enter and confirm your new account password</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        {!token ? (
          <div className="py-4 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Invalid or missing password reset token link. Please request a new link.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/forgot-password">Request Reset Link</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-md border border-border bg-background/50 py-2 pl-10 pr-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-md border border-border bg-background/50 py-2 pl-10 pr-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <MainLayout>
      <div className="relative flex min-h-[calc(100vh-16rem)] items-center justify-center overflow-hidden px-4 py-12">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
        <div className="w-full max-w-md">
          <Suspense
            fallback={
              <Card className="glassmorphism border-border/50">
                <CardContent className="flex h-48 items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  );
}
