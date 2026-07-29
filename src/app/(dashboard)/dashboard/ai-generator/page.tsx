"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Bot, RefreshCw, Copy, Download, RefreshCwIcon, ClipboardCheck, Info } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const WRITING_STYLES = [
  "Professional",
  "ATS Optimized",
  "Modern",
  "Formal",
  "Technical",
  "Executive",
  "Concise",
  "Impact Focused",
  "Friendly"
];

const EXPERIENCE_LEVELS = [
  "School Student",
  "College Student",
  "Fresher without Internship",
  "Fresher with Internship",
  "Entry Level",
  "Mid Level",
  "Senior",
  "Manager",
  "Switcher"
];

const AI_ACTIONS = [
  { value: "Career Objective", label: "Generate Career Objective" },
  { value: "Project Description", label: "Write Project Description" },
  { value: "Technical Skills", label: "Suggest Technical Skills" },
  { value: "Achievements", label: "Draft Key Achievements" },
  { value: "Cover Letter", label: "Write Cover Letter" },
  { value: "ATS Resume Optimization", label: "Optimize for ATS Compliance" },
  { value: "Interview Answers", label: "Draft Interview Q&A" },
  { value: "Career Roadmap", label: "Create Career Roadmap" },
  { value: "Custom Rewrite", label: "Custom Polish / Rewrite" }
];

export default function AiGeneratorPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = React.useState("");
  const [action, setAction] = React.useState("Career Objective");
  const [writingStyle, setWritingStyle] = React.useState("Professional");
  const [experienceLevel, setExperienceLevel] = React.useState("Mid Level");
  const [selectedResumeId, setSelectedResumeId] = React.useState("");
  const [resumes, setResumes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Fetch resumes list for database context
  React.useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await fetch("/api/resumes");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setResumes(json.data);
        }
      } catch (err) {
        console.error("Error fetching resumes for context:", err);
      }
    }
    fetchResumes();
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Short Prompt Validation
    const cleanPrompt = prompt.trim();
    if (cleanPrompt.length < 20) {
      toast({
        title: "More Detail Needed",
        description: "Please provide more details about your education, skills, projects or experience so I can generate a high-quality result.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResponse(null);
    setCopied(false);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "ai-generate",
          payload: {
            prompt: cleanPrompt,
            actionType: action,
            writingStyle,
            experienceLevel,
            resumeId: selectedResumeId || undefined,
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        // Stream text to display character-by-character or word-by-word
        const rawText = typeof json.data === "string" ? json.data : JSON.stringify(json.data, null, 2);
        simulateStreaming(rawText);
      } else {
        throw new Error(json.error || "Failed to generate suggestions.");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "An error occurred during content generation.",
        variant: "destructive",
      });
    }
  };

  const simulateStreaming = (text: string) => {
    const words = text.split(" ");
    let currentText = "";
    let index = 0;
    
    const timer = setInterval(() => {
      if (index >= words.length) {
        clearInterval(timer);
        setLoading(false);
        toast({
          title: "Suggestions Ready",
          description: "Personalized facts generated successfully.",
          variant: "success",
        });
      } else {
        currentText += (index === 0 ? "" : " ") + words[index];
        setResponse(currentText);
        index++;
      }
    }, 12); // Type words rapidly for realistic streaming effect
  };

  const handleCopyToClipboard = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Content successfully copied to clipboard.",
      variant: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!response) return;
    const element = document.createElement("a");
    const file = new Blob([response], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${action.replace(/\s+/g, "_").toLowerCase()}_output.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Downloaded",
      description: "TXT file successfully downloaded.",
      variant: "success",
    });
  };

  // Word/Character counts
  const promptCharCount = prompt.length;
  const promptWordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;

  const responseCharCount = response ? response.length : 0;
  const responseWordCount = response ? response.trim().split(/\s+/).length : 0;

  return (
    <div>
      <PageHeader
        title="Personalized AI Resume Generator"
        description="Optimize, draft, or polish your resume segments using context-aware, anti-hallucination factual AI."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Options Form Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glassmorphism">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Assistant Setup
              </CardTitle>
              <CardDescription>
                Configure parameters to align AI suggestions with your career level and style.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Select Action */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Select AI Action</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                  >
                    {AI_ACTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience Level Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Experience Level</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Writing Style Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Writing Style</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                  >
                    {WRITING_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resume Context Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    Load Resume Context
                    <Info className="h-3 w-3 text-muted-foreground" title="Feeds your resume details to the AI for factual recommendations." />
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                  >
                    <option value="">-- No Context (Prompt Only) --</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title || `Resume (${r.id.substring(0, 6)})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prompt Textarea */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-muted-foreground">Prompt Description</label>
                    <span className="text-[10px] text-muted-foreground">
                      {promptWordCount} words / {promptCharCount} chars
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    className="w-full resize-none rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    placeholder="Describe your skills, achievements, or paste a job description. Must be at least 20 characters."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
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
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Personalized Content
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-2">
          <Card className="glassmorphism flex h-full min-h-[480px] flex-col">
            <CardHeader className="border-b border-border/40 pb-4 flex flex-row justify-between items-center">
              <div className="flex items-center gap-2 text-primary">
                <Bot className="h-5 w-5" />
                <CardTitle className="text-base text-foreground">AI Copilot Output</CardTitle>
              </div>
              {response && (
                <span className="text-[10px] text-muted-foreground">
                  {responseWordCount} words / {responseCharCount} chars
                </span>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto mb-4">
                {loading && !response ? (
                  <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold">Factual AI model is analyzing details...</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Writing custom {action.toLowerCase()} statements...
                    </p>
                  </div>
                ) : response ? (
                  <div className="prose dark:prose-invert max-w-none space-y-4 text-sm text-foreground">
                    <div className="rounded-lg border border-border bg-muted/20 p-5 whitespace-pre-wrap font-sans leading-relaxed">
                      {response}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-20 text-center text-muted-foreground">
                    <MessageSquare className="mb-4 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-semibold">Your drafted AI response will display here.</p>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground/80">
                      Select your target experience level and style guidelines, then hit Generate.
                    </p>
                  </div>
                )}
              </div>

              {response && (
                <div className="mt-4 flex justify-end gap-2 border-t border-border/40 pt-4">
                  <Button variant="outline" size="sm" onClick={() => handleGenerate()} disabled={loading} className="flex items-center gap-1.5">
                    <RefreshCwIcon className="h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="flex items-center gap-1.5">
                    {copied ? <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy to Clipboard
                  </Button>
                  <Button variant="default" size="sm" onClick={handleDownloadTxt} className="flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Download TXT
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
