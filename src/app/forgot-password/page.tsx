"use client";

import * as React from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        toast({
          title: "Recovery Email Sent",
          description: "A password reset link was dispatched to your address.",
          variant: "success",
        });
      } else {
        toast({
          title: "Request Failed",
          description: json.error || "Could not request password recovery.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Request Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
                <LockIcon className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password?</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Reset your resume workspace credentials
              </p>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">Check Your Inbox</h3>
                  <p className="mx-auto mb-6 max-w-xs text-xs leading-relaxed text-muted-foreground">
                    We sent password recovery instructions to **{email}**. Click the link in the
                    email to set a new password.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
                    Resend email instructions
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
                    {isLoading ? "Sending recovery..." : "Send Recovery Email"}
                  </Button>
                </form>
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

// Simple custom Lock SVG Icon
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
