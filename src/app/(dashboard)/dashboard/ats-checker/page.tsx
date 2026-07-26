"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, ShieldAlert, CheckCircle, RefreshCw, FileText } from "lucide-react";

interface AtsReport {
  score: number;
  keywordsMatched: string[];
  keywordsMissing: string[];
  layoutIssues: string[];
}

export default function AtsCheckerPage() {
  const [isScanning, setIsScanning] = React.useState(false);
  const [jobTitle, setJobTitle] = React.useState("Senior React Engineer");
  const [report, setReport] = React.useState<AtsReport | null>(null);

  const handleUploadScan = () => {
    if (!jobTitle.trim()) return;
    setIsScanning(true);
    setReport(null);

    // Mock scan latency
    setTimeout(() => {
      setReport({
        score: 84,
        keywordsMatched: ["React 19", "TypeScript", "Tailwind CSS", "REST APIs"],
        keywordsMissing: [
          jobTitle.toLowerCase().includes("lead") ? "System Design" : "GraphQL",
          "Next.js App Router",
          "CI/CD Pipeline",
        ],
        layoutIssues: ["No major styling layout errors found. Columns parse clean."],
      });
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div>
      <PageHeader
        title="ATS Score Checker"
        description="Verify how parser systems read your CV. Optimize keyword densities against target job titles."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* File Drop Section */}
        <div className="lg:col-span-1">
          <Card className="glassmorphism flex h-full flex-col justify-between">
            <CardHeader>
              <CardTitle>Resume Upload</CardTitle>
              <CardDescription>Upload your PDF or Word resume to test parsing.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-card/25 p-8 transition-colors hover:border-primary/45">
                <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground" />
                <p className="mb-1 text-xs font-semibold">Drag and drop file here</p>
                <p className="text-[10px] text-muted-foreground">PDF, DOCX formats up to 4MB</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Target Job Title
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    placeholder="Senior React Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="flex w-full items-center justify-center gap-2"
                onClick={handleUploadScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Scanning Resume...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Scan Document
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Scan Report Dashboard */}
        <div className="lg:col-span-2">
          <Card className="glassmorphism h-full min-h-[350px]">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle>ATS Parser Report</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isScanning ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm font-semibold">Running ATS scan checks...</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Loading parser-simulation-v3...
                  </p>
                </div>
              ) : report ? (
                <div className="space-y-6">
                  {/* Score Indicator */}
                  <div className="flex items-center gap-6">
                    <div className="relative flex items-center justify-center">
                      <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-full border-[10px] border-primary/20 border-t-primary">
                        <span className="text-2xl font-extrabold">{report.score}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">ATS Score: Good</h4>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Your resume has a strong keyword density for the specified role. Address the
                        missing items below to target 90+ points.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 border-t border-border/20 pt-4 sm:grid-cols-2">
                    {/* Keywords matched */}
                    <div>
                      <h5 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Matched Keywords ({report.keywordsMatched.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {report.keywordsMatched.map((k: string) => (
                          <span
                            key={k}
                            className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Keywords missing */}
                    <div>
                      <h5 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        Missing Keywords ({report.keywordsMissing.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {report.keywordsMissing.map((k: string) => (
                          <span
                            key={k}
                            className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <ShieldAlert className="mb-4 h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm">Scan results will display here.</p>
                  <p className="mt-1 max-w-xs text-xs">
                    Choose a target job, upload your resume draft, and click scan.
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
