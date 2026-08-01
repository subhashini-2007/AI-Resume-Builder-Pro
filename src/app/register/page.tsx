"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles, Mail, Lock, User } from "lucide-react";
import { authService } from "@/services/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setIsLoading(true);

    const res = await authService.register(name, email, password, confirmPassword);
    setIsLoading(false);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "Failed to create account. Please check your credentials.");
    }
  };

  return (
    <MainLayout>
      <div className="relative flex min-h-[calc(100vh-16rem)] items-center justify-center overflow-hidden px-4 py-12">
        {/* Glow flares */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />

        <div className="w-full max-w-md">
          <Card className="glassmorphism border-border/50">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-violet-500 text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started with AI Resume Builder Pro
              </p>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full rounded-md border border-border bg-background/50 py-2 pl-10 pr-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="w-full rounded-md border border-border bg-background/50 py-2 pl-10 pr-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                    Password
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
                  {isLoading ? "Creating account..." : "Register Now"}
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link href="/dashboard" className="font-semibold text-primary hover:underline">
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
