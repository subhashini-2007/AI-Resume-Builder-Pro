import type { Metadata } from "next";
import { MainLayout } from "@/components/layouts/main-layout";
import { Sparkles, CheckCircle, Smartphone, Layout, Zap, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore the advanced capabilities of AI Resume Builder Pro, including ATS checker and AI assistant.",
};

const features = [
  {
    title: "AI Co-Writer Assistance",
    desc: "Instantly draft bullets and summaries tailored to specific job targets using AI.",
    icon: Sparkles,
  },
  {
    title: "Real-time ATS Scoring",
    desc: "Scan your resume against live ATS algorithms and get detailed optimization checklists.",
    icon: Search,
  },
  {
    title: "Tailored Layout Controls",
    desc: "Reorganize sections, adjust margins, fonts, and base themes instantly without reflow issues.",
    icon: Layout,
  },
  {
    title: "Cover Letter Generator",
    desc: "Generate contextual matching cover letters directly from your resume profiles.",
    icon: Zap,
  },
  {
    title: "Responsive Mobile Interface",
    desc: "Edit and share your resume on the go with layout adjustments optimized for mobile.",
    icon: Smartphone,
  },
  {
    title: "Verified Export Cleanliness",
    desc: "Export files into standard, cleanly formatted, parser-readable PDFs.",
    icon: CheckCircle,
  },
];

export default function FeaturesPage() {
  return (
    <MainLayout>
      <div className="relative py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                Get Hired
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover tools engineered to elevate your job search, optimize layout structures, and
              align matches.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <Card
                  key={index}
                  className="glassmorphism transition-all duration-300 hover:border-primary/30"
                >
                  <CardHeader>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{feat.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">
                    {feat.desc}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
