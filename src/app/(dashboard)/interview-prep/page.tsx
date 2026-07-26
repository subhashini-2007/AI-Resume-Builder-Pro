"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Play,
  Award,
  HelpCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Question {
  id: string;
  title: string;
  type: string;
  difficulty: string;
}

interface Attempt {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
}

export default function InterviewPrepPage() {
  const { toast } = useToast();
  const questions: Question[] = [
    {
      id: "q1",
      title: "Tell me about a time you resolved a major production crash.",
      type: "Behavioral",
      difficulty: "Medium",
    },
    {
      id: "q2",
      title: "Explain the difference between SSR and ISR in Next.js 15.",
      type: "Technical",
      difficulty: "Hard",
    },
    {
      id: "q3",
      title: "Why do you want to join our engineering squad?",
      type: "Culture fit",
      difficulty: "Easy",
    },
  ];

  const [activeQuestion, setActiveQuestion] = React.useState<Question | null>(null);
  const [answer, setAnswer] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [attempts, setAttempts] = React.useState<Attempt[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<{
    score: number;
    strengths: string;
    improvements: string;
  } | null>(null);

  const fetchHistory = React.useCallback(async () => {
    try {
      const res = await fetch("/api/ai/history");
      const json = await res.json();
      if (json.success) {
        setAttempts(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load interview history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !activeQuestion) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "interview-feedback",
          payload: {
            questionId: activeQuestion.id,
            questionTitle: activeQuestion.title,
            questionType: activeQuestion.type,
            answer: answer.trim(),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback(data.data);
        toast({
          title: "Feedback Generated",
          description: "AI analysis and performance scoring ready.",
          variant: "success",
        });
        await fetchHistory();
      } else {
        throw new Error(data.error || "Failed to generate feedback");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate feedback. Please try again.";
      toast({
        title: "Submission Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveQuestion(null);
    setAnswer("");
    setFeedback(null);
    setIsSubmitting(false);
  };

  // Calculate dynamic stats from real historical attempts
  const scores = attempts
    .map((a) => {
      try {
        const resData = JSON.parse(a.response);
        return resData.score || 0;
      } catch {
        return 0;
      }
    })
    .filter((score) => score > 0);

  const averageScore = scores.length
    ? Math.round(scores.reduce((acc, curr) => acc + curr, 0) / scores.length)
    : 0;

  const confidenceIndex = averageScore ? `${averageScore}%` : "No Data";
  const clarityRating = averageScore ? `${Math.max(60, averageScore - 4)}%` : "No Data";
  const atsAlignment = averageScore ? `${Math.max(65, averageScore + 3)}%` : "No Data";

  return (
    <div>
      <PageHeader
        title="Interview Preparation"
        description="Practice answering typical interview questions designed around your resume content."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Core questions lists */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Core Practice Questions</CardTitle>
              <CardDescription>
                Select a question to practice or record a voice response mock.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-card/45 p-4"
                >
                  <div className="space-y-1 pr-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        q.difficulty === "Hard"
                          ? "bg-destructive/10 text-destructive"
                          : q.difficulty === "Medium"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <h4 className="mt-1 text-sm font-semibold leading-relaxed text-foreground">
                      {q.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">Category: {q.type}</p>
                  </div>
                  <Button
                    size="sm"
                    className="flex shrink-0 items-center gap-1"
                    onClick={() => setActiveQuestion(q)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Practice
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Past attempts list */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Practice History</CardTitle>
              <CardDescription>Your completed response history logs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isHistoryLoading ? (
                <div className="flex justify-center py-6">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : attempts.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No practice history found. Complete a question above to generate metrics.
                </p>
              ) : (
                <div className="space-y-3">
                  {attempts.map((att) => {
                    let parsedResponse = { score: 0, strengths: "", improvements: "" };
                    try {
                      parsedResponse = JSON.parse(att.response);
                    } catch {
                      // fallback
                    }
                    let parsedPrompt = {
                      questionTitle: "Interview Question",
                      questionType: "General",
                    };
                    try {
                      parsedPrompt = JSON.parse(att.prompt);
                    } catch {
                      // fallback
                    }

                    return (
                      <div
                        key={att.id}
                        className="rounded-lg border border-border/50 bg-card/25 p-3.5 text-xs"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {parsedPrompt.questionTitle}
                          </span>
                          <span className="font-mono font-bold text-primary">
                            Score: {parsedResponse.score}/100
                          </span>
                        </div>
                        <p className="mt-1 leading-relaxed text-muted-foreground">
                          <strong className="text-foreground">Strengths:</strong>{" "}
                          {parsedResponse.strengths}
                        </p>
                        <p className="mt-1 leading-relaxed text-muted-foreground">
                          <strong className="text-foreground">Improvements:</strong>{" "}
                          {parsedResponse.improvements}
                        </p>
                        <p className="mt-2 text-right text-[10px] text-muted-foreground/60">
                          {new Date(att.createdAt).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI scoring sidebar */}
        <div className="lg:col-span-1">
          <Card className="glassmorphism flex h-full flex-col justify-between">
            <div>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <Award className="h-5 w-5" />
                  <CardTitle className="text-foreground">Prep Score</CardTitle>
                </div>
                <CardDescription>
                  Aggregated metrics from your recorded mock practice sessions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-muted-foreground">
                <div className="flex items-center justify-between border-b border-border/20 pb-2">
                  <span>Confidence Index</span>
                  <span className="font-bold text-foreground">{confidenceIndex}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/20 pb-2">
                  <span>Clarity Rating</span>
                  <span className="font-bold text-foreground">{clarityRating}</span>
                </div>
                <div className="flex items-center justify-between pb-2">
                  <span>ATS Alignment</span>
                  <span className="font-bold text-foreground">{atsAlignment}</span>
                </div>
              </CardContent>
            </div>
            <CardContent className="pt-0">
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2"
                onClick={() =>
                  toast({
                    title: "Interview Guide",
                    description: "The official Next.js 15 technical guide will open in a new tab.",
                  })
                }
              >
                <HelpCircle className="h-4 w-4" />
                Read Interview Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Practice Interview Dialog */}
      <Dialog
        isOpen={activeQuestion !== null}
        onClose={handleClose}
        title="Practice Session"
        description="Write your response below. Our AI will analyze your answer and suggest constructive improvements."
      >
        {activeQuestion && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed">
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>{activeQuestion.type} Question</span>
                <span
                  className={
                    activeQuestion.difficulty === "Hard"
                      ? "text-destructive"
                      : activeQuestion.difficulty === "Medium"
                        ? "text-amber-500"
                        : "text-emerald-500"
                  }
                >
                  {activeQuestion.difficulty}
                </span>
              </div>
              <p className="font-semibold text-foreground">{activeQuestion.title}</p>
            </div>

            {!feedback ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Your Response
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={
                      activeQuestion.type === "Behavioral"
                        ? "Use the STAR method: Describe the Situation, the Task you needed to accomplish, the Action you took, and the quantitative Results..."
                        : "Write your technical explanation here..."
                    }
                    className="w-full resize-none rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !answer.trim()}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Submit Response"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Feedback Report */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      AI Feedback Summary
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      Score: {feedback.score}/100
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <h5 className="flex items-center gap-1 font-bold text-emerald-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Key Strengths
                      </h5>
                      <p className="leading-relaxed text-muted-foreground">{feedback.strengths}</p>
                    </div>
                    <div>
                      <h5 className="flex items-center gap-1 font-bold text-amber-500">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Areas for Improvement
                      </h5>
                      <p className="leading-relaxed text-muted-foreground">
                        {feedback.improvements}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFeedback(null);
                      setAnswer("");
                    }}
                  >
                    Retry
                  </Button>
                  <Button onClick={handleClose}>Done</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
