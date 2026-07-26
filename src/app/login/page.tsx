"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles, Mail, Lock } from "lucide-react";
import { authService } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    setError("");
    setIsLoading(true);

    const res = await authService.login(email, password);
    setIsLoading(false);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "Invalid email or password credentials.");
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
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to your resume workspace</p>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-xs text-primary transition-all hover:underline">
                      Forgot password?
                    </Link>
                  </div>
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

                <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Create an account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
