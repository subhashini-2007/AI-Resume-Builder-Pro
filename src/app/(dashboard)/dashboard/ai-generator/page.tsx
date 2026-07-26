"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Bot, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AiGeneratorPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = React.useState("");
  const [action, setAction] = React.useState("Write Professional Summary");
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide a prompt to guide the generator.",
      });
      return;
    }
    setLoading(true);
    setResponse(null);

    // Mock AI streaming delay
    setTimeout(() => {
      setResponse(
        `### AI Suggestions for: "${prompt}"\n\n` +
          `**Selected Tool**: ${action}\n\n` +
          `**Summary Statement Recommendation**:\n` +
          `*"Result-driven Senior Developer with 6+ years of expertise leading engineering squads to scale responsive SaaS platforms. Expert in Next.js 15, React 19, and cloud infrastructure..."*\n\n` +
          `**Key Bullet Additions**:\n` +
          `- *"Spearheaded the migration of legacy client panels to Next.js 15, increasing page speed by 35% and improving Web Vitals scores to 98%."*\n` +
          `- *"Coordinated cross-functional teams of 8 developers using Agile methodologies, delivering product launches 2 weeks ahead of schedule."*`
      );
      setLoading(false);
      toast({
        title: "Generation Complete",
        description: "AI content was compiled successfully.",
        variant: "success",
      });
    }, 1200);
  };

  const handleCopyToClipboard = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    toast({
      title: "Copied!",
      description: "Content copied to system clipboard successfully.",
      variant: "success",
    });
  };

  const handleInsertIntoResume = () => {
    if (!response) return;
    const saved = localStorage.getItem("resume_editor_draft");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Append recommendations to summary
        const cleanContent = response.replace(/###/g, "").replace(/\*\*/g, "").trim();
        data.personalInfo.summary = data.personalInfo.summary
          ? data.personalInfo.summary + "\n\n" + cleanContent
          : cleanContent;
        localStorage.setItem("resume_editor_draft", JSON.stringify(data));
        toast({
          title: "Inserted Successfully",
          description: "Appended suggestions to your active resume summary draft.",
          variant: "success",
        });
      } catch (e) {
        console.error(e);
        toast({
          title: "Failed to Insert",
          description: "An error occurred parsing the active draft.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Draft Found",
        description: "Open the Resume Editor first to initialize a resume draft.",
      });
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
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                  >
                    <option value="Write Professional Summary">Write Professional Summary</option>
                    <option value="Optimize Work Experience Bullets">
                      Optimize Work Experience Bullets
                    </option>
                    <option value="Suggest Core Technical Skills">
                      Suggest Core Technical Skills
                    </option>
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
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                      Copy to Clipboard
                    </Button>
                    <Button size="sm" onClick={handleInsertIntoResume}>
                      Insert into Resume
                    </Button>
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
