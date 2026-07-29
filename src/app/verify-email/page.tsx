"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layouts/main-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

type Status = "loading" | "success" | "error" | "idle";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [status, setStatus] = React.useState<Status>("idle");
  const [message, setMessage] = React.useState("");

  const handleVerify = React.useCallback(async () => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link. Please request a new one.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });
      const json = await res.json();

      if (json.success) {
        setStatus("success");
        setMessage("Your email address has been verified successfully!");
      } else {
        setStatus("error");
        setMessage(json.error || "Verification failed. The link may be expired.");
      }
    } catch {
      setStatus("error");
      setMessage("A network error occurred. Please try again.");
    }
  }, [token, email]);

  React.useEffect(() => {
    if (token && email) {
      handleVerify();
    }
  }, [token, email, handleVerify]);

  return (
    <MainLayout>
      <div className="relative flex min-h-[calc(100vh-16rem)] items-center justify-center overflow-hidden px-4 py-12">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />

        <div className="w-full max-w-md">
          <Card className="glassmorphism border-border/50">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-violet-500 text-primary-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Email Verification</CardTitle>
            </CardHeader>
            <CardContent className="py-6 text-center">
              {status === "loading" && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Verifying your email…</p>
                </div>
              )}

              {status === "success" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Email Verified!</h3>
                  <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{message}</p>
                  <Link href="/login">
                    <Button className="mt-2">Sign In Now</Button>
                  </Link>
                </div>
              )}

              {status === "error" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <XCircle className="h-7 w-7 text-destructive" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Verification Failed</h3>
                  <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{message}</p>
                  <div className="flex flex-col gap-2 pt-2">
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Back to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {status === "idle" && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    No verification token found in the link.
                  </p>
                  <Link href="/login">
                    <Button variant="outline">Back to Sign In</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
