"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { TemplateThumbnail } from "@/components/shared/template-thumbnail";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [activeTemplateId, setActiveTemplateId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("resume_selected_template");
    setActiveTemplateId(saved || "ats-classic");
  }, []);

  const categories = [
    { value: "all", label: "All Templates" },
    { value: "ats", label: "ATS-Optimized" },
    { value: "modern", label: "Modern Layouts" },
    { value: "creative", label: "Creative Designs" },
  ];

  const templates = [
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

  const filteredTemplates = templates.filter(
    (t) => selectedCategory === "all" || t.category === selectedCategory
  );

  const handleSelectTemplate = (id: string) => {
    toast({
      title: "Template Selected",
      description: `Format swapped to ${id}. Opening editor...`,
      variant: "success",
    });
    localStorage.setItem("resume_selected_template", id);
    setActiveTemplateId(id);
    router.push("/dashboard/resumes/create");
  };

  return (
    <div>
      <PageHeader
        title="Resume Templates"
        description="Choose from our library of designer and ATS-tested formats. Swap templates instantly."
      />

      {/* Categories Toggle */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
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
              onClick={() => handleSelectTemplate(template.id)}
              className={cn(
                "glassmorphism group flex cursor-pointer flex-col justify-between overflow-hidden border-2 transition-all duration-300",
                isActive
                  ? "scale-[1.02] border-primary ring-2 ring-primary/20"
                  : "border-border/30 hover:border-primary/45"
              )}
            >
              {/* Template Thumbnail Render */}
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
                    handleSelectTemplate(template.id);
                  }}
                  variant={isActive ? "default" : "outline"}
                  className="flex w-full items-center justify-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  {isActive ? "Selected" : "Select Template"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
