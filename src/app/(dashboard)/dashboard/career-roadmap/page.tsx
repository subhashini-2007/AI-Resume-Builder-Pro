"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Milestone, Flag, Target, Award, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CareerRoadmapPage() {
  const router = useRouter();

  const steps = [
    {
      title: "Core Profile Foundation",
      desc: "Complete your contact details, education history, and export a clean baseline ATS resume.",
      status: "Completed",
      icon: Target,
      href: "/dashboard/resumes",
    },
    {
      title: "AI Keyword Alignment",
      desc: "Run ATS scans against senior engineer targets and optimize keyword volumes to hit 85+ score.",
      status: "In Progress",
      icon: Milestone,
      href: "/dashboard/ats-checker",
    },
    {
      title: "Cover Letter Tailoring",
      desc: "Compile matching cover letters for 3 primary target roles and align structural styles.",
      status: "Upcoming",
      icon: Flag,
      href: "/dashboard/cover-letter",
    },
    {
      title: "Interview Confidence Check",
      desc: "Practice technical Next.js and behavioral STAR responses in the practice simulator.",
      status: "Upcoming",
      icon: Award,
      href: "/dashboard/interview-prep",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Career Roadmap"
        description="Follow our structured milestones designed to optimize your resume and prepare your application."
      />

      <div className="mx-auto max-w-3xl">
        <Card className="glassmorphism p-6 md:p-8">
          <div className="relative ml-3 space-y-10 border-l border-border pl-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = step.status === "Completed";
              const isInProgress = step.status === "In Progress";

              return (
                <div key={idx} className="relative">
                  {/* Indicator Dot */}
                  <span
                    className={`absolute -left-[35px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border bg-background transition-colors ${
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : isInProgress
                          ? "border-primary text-primary ring-4 ring-primary/10"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                  </span>

                  {/* Milestone Card */}
                  <div className="space-y-1 rounded-xl border border-border/50 bg-card/30 p-4 md:p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-500"
                            : isInProgress
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                    {isInProgress && (
                      <Button
                        size="sm"
                        className="mt-4 flex items-center gap-1"
                        onClick={() => router.push(step.href)}
                      >
                        Go to Task
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
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
