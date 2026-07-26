"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { cn } from "@/lib/utils";
import { Mail, Sparkles, RefreshCw, FileText } from "lucide-react";

export default function CoverLetterPage() {
  const [jobTitle, setJobTitle] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  const jobTitleError = touched["jobTitle"] && !jobTitle.trim() ? "Target Job Title is required." : null;
  const companyError = touched["company"] && !company.trim() ? "Company Name is required." : null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ jobTitle: true, company: true });
    if (!jobTitle.trim() || !company.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "cover-letter",
          payload: { jobTitle: jobTitle.trim(), company: company.trim() },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        console.error("Cover letter generation failed:", data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Cover Letter Generator"
        description="Compile personalized, matching cover letters using AI for any job application."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Input */}
        <div className="lg:col-span-1">
          <Card className="glassmorphism h-full">
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>
                Enter the job parameters to structure your cover letter.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Target Job Title
                  </label>
                  <input
                    type="text"
                    id="cover-job-title"
                    aria-invalid={!!jobTitleError}
                    aria-describedby={jobTitleError ? "cover-job-title-error" : undefined}
                    onBlur={() => setTouched((prev) => ({ ...prev, jobTitle: true }))}
                    placeholder="Senior Full Stack Engineer"
                    className={cn(
                      "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                      jobTitleError
                        ? "border-destructive focus:border-destructive text-destructive"
                        : "border-border focus:border-primary"
                    )}
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                  <FieldError id="cover-job-title-error" error={jobTitleError} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="cover-company"
                    aria-invalid={!!companyError}
                    aria-describedby={companyError ? "cover-company-error" : undefined}
                    onBlur={() => setTouched((prev) => ({ ...prev, company: true }))}
                    placeholder="Tech Startup Corp"
                    className={cn(
                      "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                      companyError
                        ? "border-destructive focus:border-destructive text-destructive"
                        : "border-border focus:border-primary"
                    )}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                  <FieldError id="cover-company-error" error={companyError} />
                </div>

                <Button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Compiling Letter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Letter
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Output */}
        <div className="lg:col-span-2">
          <Card className="glassmorphism flex h-full min-h-[350px] flex-col">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="h-5 w-5" />
                <CardTitle className="text-base text-foreground">Cover Letter Draft</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              {loading ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm font-semibold">AI is drafting cover letter...</p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/40 p-4 font-serif text-sm leading-relaxed text-muted-foreground">
                    {result}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Copy Text
                    </Button>
                    <Button size="sm" className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Mail className="mb-4 h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm">Your compiled cover letter will display here.</p>
                  <p className="mt-1 max-w-xs text-xs">
                    Submit job title and company to auto-generate matching text.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
