"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FileText, Sparkles, Shield, Send, Plus, Award, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { LoadingState } from "@/components/shared/states";

interface ResumeItem {
  id: string;
  title: string;
  score: number;
  updatedAt: string;
  status: "Draft" | "Published";
}

export default function DashboardHomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [resumes, setResumes] = React.useState<ResumeItem[]>([]);
  const [coverLettersCount, setCoverLettersCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    async function loadDashboardData() {
      try {
        const [resumesRes, lettersRes] = await Promise.all([
          fetch("/api/resumes"),
          fetch("/api/cover-letters"),
        ]);

        const resumesJson = await resumesRes.json();
        const lettersJson = await lettersRes.json();

        if (resumesJson.success) {
          interface DBResumeItem {
            id: string;
            title?: string;
            status?: string;
            updatedAt: string;
            atsReports?: Array<{ score: number }>;
          }

          const items = (resumesJson.data.items || []).map((r: DBResumeItem) => ({
            id: r.id,
            title: r.title || "Untitled Resume",
            score: r.atsReports?.[0]?.score ?? 0,
            updatedAt: new Date(r.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            status: (r.status === "PUBLISHED" ? "Published" : "Draft") as "Published" | "Draft",
          }));
          setResumes(items);
        }

        if (lettersJson.success) {
          setCoverLettersCount(lettersJson.data.length || 0);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleCreateResume = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "Draft Created",
          description: "A new resume draft has been initialized in the database.",
          variant: "success",
        });
        router.push(`/dashboard/resumes/create?id=${json.data.id}`);
      } else {
        throw new Error(json.error || "Failed to create draft");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start new resume draft.";
      toast({
        title: "Creation Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/resumes/${deleteId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        setResumes((prev) => prev.filter((r) => r.id !== deleteId));
        toast({
          title: "Resume Deleted",
          description: "Resume deleted successfully.",
          variant: "success",
        });
        setDeleteId(null);
      } else {
        throw new Error(json.error || "Failed to delete resume.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete resume. Please try again.";
      toast({
        title: "Delete Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const totalResumes = resumes.length;
  const avgScore = resumes.length
    ? Math.round(resumes.reduce((acc, curr) => acc + (curr.score || 0), 0) / resumes.length)
    : 0;

  const stats = [
    {
      label: "Total Resumes",
      value: String(totalResumes),
      icon: FileText,
      change: "Stored in cloud database",
    },
    {
      label: "Avg ATS Score",
      value: `${avgScore}/100`,
      icon: Shield,
      change: "Based on active audits",
    },
    {
      label: "Cover Letters",
      value: String(coverLettersCount),
      icon: Send,
      change: "Generated with AI",
    },
  ];

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Welcome back to your career workspace." />
        <LoadingState />
      </div>
    );
  }

  return (
    <div>
      {/* Dynamic reusable PageHeader */}
      <PageHeader
        title="Dashboard"
        description="Welcome back to your career workspace. Create and refine resumes using AI feedback."
      >
        <Button
          onClick={handleCreateResume}
          className="flex items-center gap-2"
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Resume
            </>
          )}
        </Button>
      </PageHeader>

      {/* Grid Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glassmorphism">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {stat.label}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <p className="mt-1 text-[10px] text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Resumes List */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Recent Resumes</CardTitle>
              <CardDescription>Manage and optimize your active drafts.</CardDescription>
            </CardHeader>
            <CardContent>
              {resumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                  <FileText className="mb-3 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-semibold">No resumes found</p>
                  <p className="mt-0.5 text-xs">Create your first resume draft to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {resumes.slice(0, 3).map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">{resume.title}</h4>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Updated {resume.updatedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* ATS badge */}
                        <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          <Award className="h-3 w-3" />
                          {resume.score} ATS
                        </span>
                        <span className="hidden text-xs text-muted-foreground sm:inline-block">
                          {resume.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/resumes/create?id=${resume.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteId(resume.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick AI Suggestions widget */}
        <div>
          <Card className="glassmorphism flex h-full flex-col justify-between">
            <div>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <CardTitle className="text-foreground">AI Career Advice</CardTitle>
                </div>
                <CardDescription>
                  Generated actions based on current active resumes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <div className="rounded-lg border border-border bg-card/40 p-3">
                  <h5 className="mb-1 text-xs font-semibold text-foreground">Boost Active Verbs</h5>
                  <p className="text-xs">
                    Replace passive phrases like "responsible for" with action words like
                    "spearheaded" or "engineered" to improve ATS score.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card/40 p-3">
                  <h5 className="mb-1 text-xs font-semibold text-foreground">Target Skill Gap</h5>
                  <p className="text-xs">
                    Add "Next.js 15" or "React 19" to your tech stack skills card to align with
                    leading leads in the market database.
                  </p>
                </div>
              </CardContent>
            </div>
            <CardContent className="pt-0">
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2"
                onClick={() => router.push("/dashboard/ai-generator")}
              >
                <Sparkles className="h-4 w-4" />
                Ask AI Assistant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deleteId}
        onClose={() => {
          if (!isDeleting) setDeleteId(null);
        }}
        title="Delete Resume"
        description="Are you sure you want to permanently delete this resume?"
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteId(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteResume}
            disabled={isDeleting}
            className="flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
