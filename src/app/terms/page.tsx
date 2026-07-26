import type { Metadata } from "next";
import { MainLayout } from "@/components/layouts/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms of Service for AI Resume Builder Pro.",
};

export default function TermsOfServicePage() {
  return (
    <MainLayout>
      <div className="relative overflow-hidden py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Terms of Service
            </h1>
            <p className="font-mono text-sm text-muted-foreground">Last Updated: July 23, 2026</p>
          </div>

          <Card className="glassmorphism">
            <CardContent className="space-y-6 pt-6 text-sm leading-relaxed text-muted-foreground">
              <section className="space-y-2">
                <h3 className="text-base font-bold text-foreground">1. Agreement to Terms</h3>
                <p>
                  By accessing or utilizing AI Resume Builder Pro, you agree to comply with and be
                  bound by these Terms of Service. If you disagree, do not use the services.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-foreground">
                  2. User Account Responsibilities
                </h3>
                <p>
                  You are responsible for safeguarding your login keys and session files. You agree
                  to provide accurate, up-to-date professional profile info during CV compilation.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-foreground">3. Usage Restraints</h3>
                <p>
                  You may not use our platform to compile fraudulent resumes, distribute phishing
                  documents, or overload AI generation APIs via automated scripts.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-foreground">4. Subscriptions & Billing</h3>
                <p>
                  Fees for premium billing tiers are processed on a recurring basis. All fees are
                  non-refundable unless specified otherwise in custom contracts.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
