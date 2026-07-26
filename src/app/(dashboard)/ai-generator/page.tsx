"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Bot, RefreshCw, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { CharacterCounter } from "@/components/ui/character-counter";

interface DBExperienceInject {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface DBEducationInject {
  school?: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
}

interface DBSkillInject {
  name: string;
}

interface DBResumeInject {
  title?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  location?: string;
  website?: string;
  avatar?: string;
  selectedTemplate?: string;
  status?: string;
  experiences?: DBExperienceInject[];
  educations?: DBEducationInject[];
  skills?: DBSkillInject[];
}

interface ResumeDropdownItem {
  id: string;
  title: string;
}

export default function AiGeneratorPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = React.useState("");
  const [actionType, setActionType] = React.useState("Write Professional Summary");
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Resume Injection States
  const [resumes, setResumes] = React.useState<ResumeDropdownItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = React.useState("");
  const [isInserting, setIsInserting] = React.useState(false);

  // Load existing resumes for injection list
  React.useEffect(() => {
    async function loadResumes() {
      try {
        const res = await fetch("/api/resumes");
        const json = await res.json();
        if (json.success && json.data.items) {
          interface DBResumeShort {
            id: string;
            title?: string;
          }
          const items = json.data.items.map((r: DBResumeShort) => ({
            id: r.id,
            title: r.title || "Untitled Resume",
          }));
          setResumes(items);
          if (items.length > 0) {
            setSelectedResumeId(items[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load resumes for generator list:", err);
      }
    }
    loadResumes();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    setResponse(null);
    setCopied(false);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "ai-generate",
          payload: { prompt, actionType },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResponse(data.data);
        toast({
          title: "Suggestions Ready",
          description: "AI model completed generation successfully.",
          variant: "success",
        });
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not generate content from Gemini API.";
      toast({
        title: "Generation Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    toast({
      title: "Copied",
      description: "AI response copied to your clipboard.",
      variant: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertIntoResume = async () => {
    if (!response || !selectedResumeId) return;
    setIsInserting(true);

    try {
      // 1. Fetch current resume
      const getRes = await fetch(`/api/resumes/${selectedResumeId}`);
      const getJson = await getRes.json();
      if (!getJson.success) {
        throw new Error(getJson.error || "Failed to load target resume details");
      }
      const resume = getJson.data as DBResumeInject;

      // Clean the AI text of markdown headers for summary inject
      const plainText = response
        .replace(/### Suggestions/gi, "")
        .replace(/### AI Suggestions for: ".*"/gi, "")
        .replace(/\*\*Summary Statement Recommendation\*\*:/gi, "")
        .replace(/<b>/g, "")
        .replace(/<\/b>/g, "")
        .trim();

      // 2. Put back with updated summary
      const updateRes = await fetch(`/api/resumes/${selectedResumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resume.title,
          summary: plainText, // inject summary content
          fullName: resume.fullName || "",
          phone: resume.phone || "",
          email: resume.email || "",
          location: resume.location || "",
          website: resume.website || "",
          avatar: resume.avatar || "",
          selectedTemplate: resume.selectedTemplate || "ats-classic",
          status: resume.status || "DRAFT",
          experiences: (resume.experiences || []).map((exp: DBExperienceInject, idx: number) => ({
            company: exp.company || "",
            role: exp.role || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            description: exp.description || "",
            order: idx,
          })),
          educations: (resume.educations || []).map((edu: DBEducationInject, idx: number) => ({
            school: edu.school || "",
            degree: edu.degree || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            order: idx,
          })),
          skills: (resume.skills || []).map((s: DBSkillInject, idx: number) => ({
            name: s.name,
            order: idx,
          })),
        }),
      });

      const updateJson = await updateRes.json();
      if (updateJson.success) {
        toast({
          title: "Injected Successfully",
          description: "Summary text replaced in target resume profile.",
          variant: "success",
        });
      } else {
        throw new Error(updateJson.error || "Failed to update resume");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to inject content into target resume.";
      toast({
        title: "Insertion Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Resume Generator"
        description="Prompt our AI to write summaries, optimize experience bullets, or rewrite content."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Input Form */}
        <div className="lg:col-span-1">
          <Card className="glassmorphism h-full">
            <CardHeader>
              <CardTitle>AI Assistant Input</CardTitle>
              <CardDescription>
                Enter details about your job target or specific experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Select Action
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                  >
                    <option>Write Professional Summary</option>
                    <option>Optimize Work Experience Bullets</option>
                    <option>Suggest Core Technical Skills</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Prompt / Job Description
                  </label>
                  <textarea
                    rows={6}
                    className="w-full resize-none rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    placeholder="E.g., Write a professional summary for a Senior React Engineer with 5 years experience applying to Acmo Corp..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <CharacterCounter currentLength={prompt.length} maxLength={1000} />
                </div>

                <Button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Drafting with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-2">
          <Card className="glassmorphism flex h-full min-h-[350px] flex-col">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Bot className="h-5 w-5" />
                <CardTitle className="text-base text-foreground">AI Copilot Output</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              {loading ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold">AI is analyzing prompt details...</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Generating optimized CV statements...
                  </p>
                </div>
              ) : response ? (
                <div className="prose dark:prose-invert max-w-none space-y-4 text-sm text-muted-foreground">
                  <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                    {response.split("\n\n").map((para, idx) => {
                      if (para.startsWith("###")) {
                        return (
                          <h4 key={idx} className="text-md mb-2 font-bold text-foreground">
                            {para.replace("### ", "")}
                          </h4>
                        );
                      }
                      if (para.startsWith("**")) {
                        return (
                          <div key={idx} className="mb-4">
                            <span className="mb-2 block font-bold text-foreground">
                              {para.split("\n")[0].replace(/\*\*/g, "")}
                            </span>
                            <ul className="mt-1 list-disc space-y-1 pl-4">
                              {para
                                .split("\n")
                                .slice(1)
                                .map((li, lIdx) => (
                                  <li key={lIdx}>{li.replace("- ", "").replace(/\*/g, "")}</li>
                                ))}
                            </ul>
                          </div>
                        );
                      }
                      return <p key={idx}>{para}</p>;
                    })}
                  </div>

                  <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-border/20 pt-4 sm:flex-row">
                    {resumes.length > 0 && (
                      <div className="flex w-full items-center gap-2 sm:w-auto">
                        <span className="whitespace-nowrap text-xs font-semibold text-muted-foreground">
                          Target Resume:
                        </span>
                        <select
                          className="rounded-md border border-border bg-background/50 px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                          value={selectedResumeId}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                        >
                          {resumes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex w-full justify-end gap-2 sm:w-auto">
                      <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                        {copied ? (
                          <Check className="mr-1 h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="mr-1 h-4 w-4" />
                        )}
                        Copy to Clipboard
                      </Button>
                      {resumes.length > 0 && (
                        <Button size="sm" onClick={handleInsertIntoResume} disabled={isInserting}>
                          {isInserting ? (
                            <>
                              <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
                              Inserting...
                            </>
                          ) : (
                            "Insert into Resume"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <MessageSquare className="mb-4 h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm">Your drafted AI response will display here.</p>
                  <p className="mt-1 max-w-xs text-xs">
                    Provide a prompt and click "Generate" to kickstart your writing.
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
