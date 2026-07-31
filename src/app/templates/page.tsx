"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Check, X, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { TemplateThumbnail } from "@/components/shared/template-thumbnail";
import { ResumeTemplates, ResumeData } from "@/components/shared/resume-templates";
import { useToast } from "@/components/ui/toast";
import { authService } from "@/services/auth";

// ─── Sample resume data for live preview ─────────────────────────────────────
const SAMPLE_DATA: ResumeData = {
  personalInfo: {
    fullName: "Alex Morgan",
    title: "Senior Full Stack Engineer",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    website: "https://alexmorgan.dev",
    avatar: "",
    summary:
      "Senior Full Stack Engineer with 6+ years of experience architecting high-scalability web applications using Next.js 15, React 19, TypeScript, and Node.js.",
  },
  experiences: [
    {
      id: "exp-1",
      company: "TechCorp Solutions",
      role: "Lead Full Stack Engineer",
      startDate: "2021",
      endDate: "Present",
      description:
        "Spearheaded frontend migration to Next.js 15 App Router, boosting page load speeds by 40%.",
    },
    {
      id: "exp-2",
      company: "Innovate Labs",
      role: "Software Engineer",
      startDate: "2018",
      endDate: "2021",
      description:
        "Built scalable REST & GraphQL APIs handling 2M+ daily active requests with 99.99% uptime.",
    },
  ],
  educations: [
    {
      id: "edu-1",
      school: "University of California, Berkeley",
      degree: "B.S. Computer Science",
      startDate: "2014",
      endDate: "2018",
    },
  ],
  skills: [
    "Next.js 15",
    "React 19",
    "TypeScript",
    "Prisma ORM",
    "PostgreSQL",
    "Tailwind CSS",
    "Node.js",
    "GraphQL",
  ],
};

// ─── Template catalogue ───────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "ats-classic",
    name: "ATS Classic",
    desc: "A minimal, highly parseable single-column layout.",
    category: "ats",
  },
  {
    id: "modern",
    name: "Modern Executive",
    desc: "Bold headers and a clean sidebar column structure.",
    category: "modern",
  },
  {
    id: "minimal",
    name: "Creative Minimalist",
    desc: "For designers and marketing profiles seeking style.",
    category: "creative",
  },
  {
    id: "executive",
    name: "Executive Serif",
    desc: "Elegant serif typography for executive listings.",
    category: "modern",
  },
  {
    id: "creative",
    name: "Creative Accent",
    desc: "Vibrant accent headers for modern builders.",
    category: "creative",
  },
  {
    id: "corporate",
    name: "Corporate Navy",
    desc: "Professional layouts with subtle navy dividers.",
    category: "ats",
  },
  {
    id: "elegant",
    name: "Elegant Amber",
    desc: "Graceful gold accents with classical styling.",
    category: "creative",
  },
  {
    id: "compact",
    name: "Compact Standard",
    desc: "Dense text paddings fitting dense descriptions.",
    category: "ats",
  },
  {
    id: "student",
    name: "Student Entry",
    desc: "Puts education and university courses first.",
    category: "ats",
  },
  {
    id: "developer",
    name: "Developer Terminal",
    desc: "Monospace coding terminal theme layout.",
    category: "creative",
  },
];

const CATEGORIES = [
  { value: "all", label: "All Templates" },
  { value: "ats", label: "ATS-Optimized" },
  { value: "modern", label: "Modern Layouts" },
  { value: "creative", label: "Creative Designs" },
];

// ─── Page Component ───────────────────────────────────────────────────────────
export default function PublicTemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [activeTemplateId, setActiveTemplateId] = React.useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  // Load previously selected template from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("resume_selected_template");
    setActiveTemplateId(saved || "ats-classic");
  }, []);

  const filteredTemplates = TEMPLATES.filter(
    (t) => selectedCategory === "all" || t.category === selectedCategory
  );

  const handleSelectTemplate = (id: string, name: string) => {
    localStorage.setItem("resume_selected_template", id);
    setActiveTemplateId(id);

    if (authService.isAuthenticated()) {
      toast({
        title: "Template Selected",
        description: `Format swapped to ${name}. Opening editor…`,
        variant: "success",
      });
      router.push("/dashboard/resumes/create");
    } else {
      // Guests: open preview modal with a sign-in CTA
      setPreviewTemplate({ id, name });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Public Navbar – no RouteGuard, no dashboard layout */}
      <Navbar />

      <main className="flex-1 px-6 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Resume Templates
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose from our library of designer and ATS-tested formats. Preview any template
              instantly — no login required.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Go to Dashboard
              </Link>
              <span className="text-muted-foreground/50">to start creating resumes</span>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-8 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.value)}
                className="rounded-full text-xs"
                size="sm"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => {
              const isActive = template.id === activeTemplateId;

              return (
                <Card
                  key={template.id}
                  onClick={() =>
                    setPreviewTemplate({ id: template.id, name: template.name })
                  }
                  className={cn(
                    "glassmorphism group flex cursor-pointer flex-col justify-between overflow-hidden border-2 transition-all duration-300",
                    isActive
                      ? "scale-[1.02] border-primary ring-2 ring-primary/20"
                      : "border-border/30 hover:border-primary/45"
                  )}
                >
                  {/* Template Thumbnail */}
                  <div className="relative h-44 w-full overflow-hidden border-b border-border/40">
                    <TemplateThumbnail
                      templateId={template.id}
                      className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute right-3 top-3 rounded-full border border-border bg-background/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
                      {template.category}
                    </div>
                    {isActive && (
                      <div className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                        Active
                      </div>
                    )}
                  </div>

                  <div>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-bold">{template.name}</CardTitle>
                      <CardDescription className="text-xs">{template.desc}</CardDescription>
                    </CardHeader>
                  </div>

                  <CardFooter className="flex gap-2 border-t border-border/20 pt-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate({ id: template.id, name: template.name });
                      }}
                      variant="outline"
                      className="flex flex-1 items-center justify-center gap-1 text-xs"
                      size="sm"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTemplate(template.id, template.name);
                      }}
                      variant={isActive ? "default" : "secondary"}
                      className="flex flex-1 items-center justify-center gap-1 text-xs"
                      size="sm"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {isActive ? "Selected" : "Use Template"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />

      {/* Live Preview Modal – publicly accessible */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{previewTemplate.name}</h3>
                <p className="text-xs text-muted-foreground">Full sample layout preview</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewTemplate(null)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Body: Rendered Resume */}
            <div className="flex-1 overflow-y-auto bg-slate-950/40 p-6">
              <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-border/40 bg-white p-6 text-slate-900 shadow-xl">
                <ResumeTemplates templateId={previewTemplate.id} data={SAMPLE_DATA} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border/40 bg-background px-6 py-4">
              <span className="text-xs text-muted-foreground">
                Format: <strong className="text-foreground">{previewTemplate.name}</strong>
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                 <Button
                    size="sm"
                    onClick={() => {
                      localStorage.setItem("resume_selected_template", previewTemplate.id);
                      setActiveTemplateId(previewTemplate.id);
                      setPreviewTemplate(null);
                      router.push("/dashboard/resumes/create");
                    }}
                    className="gap-1.5"
                  >
                    <Sparkles className="h-4 w-4" />
                    Create Resume with This Template
                  </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(" ");
}
