"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles, RefreshCw, FileText } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function CoverLetterPage() {
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !company.trim()) return;
    setLoading(true);
    setResult(null);

    // Mock Letter compilation
    setTimeout(() => {
      setResult(
        `Dear Hiring Team at ${company},\n\n` +
          `I am writing to express my enthusiastic interest in the ${jobTitle} position. With over 5 years of experience developing responsive web applications using Next.js, React, and TypeScript, I am confident in my ability to contribute value to your development team immediately.\n\n` +
          `Throughout my career, I have focused on building performant interfaces that improve user experience. In my previous role at Acme Corp, I led the migration of main product pages to Next.js, resulting in a 35% speed improvement. I look forward to bringing this same dedication to ${company}.\n\n` +
          `Thank you for your time and consideration.\n\n` +
          `Sincerely,\n` +
          `Job Seeker`
      );
      setLoading(false);
      toast({
        title: "Letter Compiled",
        description: "Successfully generated matching cover letter.",
        variant: "success",
      });
    }, 1200);
  };

  const handleCopyText = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast({
      title: "Copied!",
      description: "Cover letter copied to clipboard.",
      variant: "success",
    });
  };

  const handleExportPDF = () => {
    if (!result) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Blocker Active",
        description: "Please enable popups to export the cover letter.",
        variant: "destructive",
      });
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Cover Letter - ${company}</title>
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; padding: 50px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
            .date { margin-bottom: 25px; font-weight: bold; }
            .body { white-space: pre-wrap; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="date">${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
          <div class="body">${result}</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
                    required
                    placeholder="Senior Full Stack Engineer"
                    className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tech Startup Corp"
                    className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
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
                    <Button variant="outline" size="sm" onClick={handleCopyText}>
                      Copy Text
                    </Button>
                    <Button size="sm" className="flex items-center gap-1" onClick={handleExportPDF}>
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
