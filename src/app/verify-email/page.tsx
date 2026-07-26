"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 4-digit code.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account Verified!",
        description: "Your email has been confirmed. Redirecting to login...",
        variant: "success",
      });
      router.push("/login");
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="relative flex min-h-[calc(100vh-16rem)] items-center justify-center overflow-hidden px-4 py-12">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />

        <div className="w-full max-w-md">
          <Card className="glassmorphism border-border/50">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-violet-500 text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Verify Email</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Confirm your verification OTP code
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="mb-4 space-y-2 text-center">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    We sent a 4-digit confirmation code to your registered email address. Please
                    input it below to complete registration.
                  </p>
                </div>

                <div className="space-y-1">
                  <input
                    id="code"
                    type="text"
                    required
                    maxLength={4}
                    className="w-full rounded-md border border-border bg-background/50 px-3 py-2.5 text-center text-lg font-extrabold tracking-[1em] transition-colors focus:border-primary focus:outline-none"
                    placeholder="0000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Code...
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
