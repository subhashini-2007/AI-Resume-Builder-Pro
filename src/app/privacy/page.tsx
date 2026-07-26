import type { Metadata } from "next";
import { MainLayout } from "@/components/layouts/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Privacy Policy for AI Resume Builder Pro to understand how we secure your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <div className="relative overflow-hidden py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="font-mono text-sm text-muted-foreground">Last Updated: July 23, 2026</p>
          </div>

          <Card className="glassmorphism">
            <CardContent className="space-y-6 pt-6 text-sm leading-relaxed text-muted-foreground">
              <section className="space-y-2">
                <h3 className="text-base font-bold text-foreground">1. Information We Collect</h3>
                <p>
                  We collect profile details that you supply directly during CV creation, including
                  your contact info (email, name, phone, address), employment history, education,
                  skills, and base64 encoded profile pictures. We do not index these files publicly.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-foreground">2. How We Use Your Data</h3>
                <p>
                  Your information is used strictly to render resume layouts, generate cover
                  letters, and score your templates. AI processing calculations are held in secure
                  sessions and are not used to train generic foundation models.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-foreground">3. Security Metrics</h3>
                <p>
                  We implement robust database encryption and SSL/TLS transmission channels to
                  secure your files. Local sync storage (localStorage) is kept sandboxed within your
                  browser.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-foreground">4. Cookies</h3>
                <p>
                  We use cookies (specifically `session_token`) to maintain authentication states.
                  You can clear cookies inside your browser at any time.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
