import type { Metadata } from "next";
import { MainLayout } from "@/components/layouts/main-layout";
import { Users, Award, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn more about the team behind AI Resume Builder Pro and our mission to help job seekers succeed.",
};

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="relative overflow-hidden py-20">
        {/* Glow flares */}
        <div className="absolute left-1/2 top-1/4 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Empowering Careers with{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We build tools that bridge the gap between talented job seekers and ATS scanners,
              helping you tell your professional story impactfully.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="glassmorphism">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <CardTitle>User-First Design</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                Every workflow in our editor is designed to be frictionless, giving you professional
                control over your document's styling.
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Award className="h-5 w-5" />
                </div>
                <CardTitle>ATS Optimization</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                Our templates are exhaustively tested against industry-standard parsing systems,
                maximizing your callback percentages.
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle>Privacy Guarded</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                Your resume drafts and data are securely handled. We never sell your personal
                information or background profiles.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
