"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Milestone, Flag, Target, Award, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  status: "Completed" | "In Progress" | "Upcoming";
  order: number;
}

const STATIC_STEPS_META = [
  {
    title: "Core Profile Foundation",
    desc: "Complete your contact details, education history, and export a clean baseline ATS resume.",
    icon: Target,
    href: "/resumes",
  },
  {
    title: "AI Keyword Alignment",
    desc: "Run ATS scans against senior engineer targets and optimize keyword volumes to hit 85+ score.",
    icon: Milestone,
    href: "/ats-checker",
  },
  {
    title: "Cover Letter Tailoring",
    desc: "Compile matching cover letters for 3 primary target roles and align structural styles.",
    icon: Flag,
    href: "/cover-letter",
  },
  {
    title: "Interview Confidence Check",
    desc: "Practice technical Next.js and behavioral STAR responses in the practice simulator.",
    icon: Award,
    href: "/interview-prep",
  },
];

export default function CareerRoadmapPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const fetchTasks = React.useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const json = await res.json();
      if (json.success) {
        setTasks(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load roadmap tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleTaskStatus = async (task: TaskItem) => {
    if (isUpdating) return;
    setIsUpdating(true);

    const newStatus = task.status === "Completed" ? "In Progress" : "Completed";

    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          status: newStatus,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast({
          title: "Milestone Updated",
          description: `"${task.title}" marked as ${newStatus}.`,
          variant: "success",
        });
        await fetchTasks();
      } else {
        throw new Error(json.error || "Update failed");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update milestone status.";
      toast({
        title: "Update Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Career Roadmap" description="Follow our structured milestones." />
        <div className="flex min-h-[300px] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Combine database tasks state with static rendering descriptions/icons
  const steps = STATIC_STEPS_META.map((meta, index) => {
    const dbTask = tasks.find((t) => t.title === meta.title) || {
      id: String(index),
      title: meta.title,
      status: index === 0 ? "Completed" : index === 1 ? "In Progress" : "Upcoming",
      order: index,
    };
    return {
      ...meta,
      dbTask,
    };
  });

  return (
    <div>
      <PageHeader
        title="Career Roadmap"
        description="Follow our structured milestones designed to optimize your resume and prepare your application."
      />

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Progress Tracker Banner */}
        <Card className="glassmorphism p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Roadmap Progress</h3>
              <p className="text-xs text-muted-foreground">
                {completedCount} of {tasks.length} milestones accomplished
              </p>
            </div>
            <span className="text-lg font-extrabold text-primary">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>

        {/* Timeline Milestones Card */}
        <Card className="glassmorphism p-6 md:p-8">
          <div className="relative ml-3 space-y-10 border-l border-border pl-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const status = step.dbTask.status;
              const isCompleted = status === "Completed";
              const isInProgress = status === "In Progress";

              return (
                <div key={idx} className="relative">
                  {/* Indicator Dot (Interactive Status Toggle) */}
                  <button
                    onClick={() => handleToggleTaskStatus(step.dbTask)}
                    disabled={isUpdating}
                    className={`absolute -left-[35px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border bg-background transition-all hover:scale-110 active:scale-95 ${
                      isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : isInProgress
                          ? "border-primary bg-background text-primary ring-4 ring-primary/10"
                          : "border-border bg-background text-muted-foreground"
                    }`}
                    title="Click to toggle status"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                  </button>

                  {/* Milestone Card (Clickable to edit/visit) */}
                  <div
                    onClick={() => router.push(step.href)}
                    className={cn(
                      "group cursor-pointer space-y-1 rounded-xl border bg-card/30 p-4 transition-all duration-300 hover:bg-card/50 md:p-5",
                      isCompleted
                        ? "border-emerald-500/20 hover:border-emerald-500/40"
                        : isInProgress
                          ? "border-primary/20 shadow-lg shadow-primary/5 hover:border-primary/40"
                          : "border-border/50 hover:border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                        {step.title}
                      </h4>
                      <span
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid triggering route redirect
                          handleToggleTaskStatus(step.dbTask);
                        }}
                        className={`inline-flex cursor-pointer items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-opacity hover:opacity-80 ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-500"
                            : isInProgress
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                        title="Click to toggle status"
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                    <div className="mt-4 flex items-center justify-between pt-2">
                      <span className="text-[10px] text-muted-foreground transition-colors group-hover:text-foreground">
                        Click card to visit task page
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex h-7 items-center gap-1 px-2 py-0 text-xs font-semibold transition-transform group-hover:translate-x-1"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          router.push(step.href);
                        }}
                      >
                        Go to Task
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
