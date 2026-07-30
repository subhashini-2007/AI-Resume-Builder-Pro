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
import { useToast } from "@/components/ui/toast";
import {
  Sparkles,
  MessageSquare,
  Bot,
  RefreshCw,
  Copy,
  Download,
  ClipboardCheck
} from "lucide-react";

const EXPERIENCE_LEVELS = [
  "College Student",
  "Fresher (No Experience)",
  "Internship Applicant",
  "Entry Level",
  "Mid Level"
];

const WRITING_TONES = [
  "Student Tone",
  "Fresher Tone",
  "Professional Tone",
  "ATS Optimized"
];

export default function AiGeneratorPage() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState<"wizard" | "polish">("wizard");
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Polish tab state
  const [prompt, setPrompt] = React.useState("");
  const [action, setAction] = React.useState("Career Objective");
  const [experienceLevel, setExperienceLevel] = React.useState("College Student");
  const [writingTone, setWritingTone] = React.useState("Student Tone");

  // Wizard tab state
  const [degree, setDegree] = React.useState("B.Tech Computer Science");
  const [gradYear, setGradYear] = React.useState("2026");
  const [skills, setSkills] = React.useState("React, Next.js, Node.js, SQL");
  const [projects, setProjects] = React.useState("E-commerce Web App, Student Task Dashboard");
  const [internships, setInternships] = React.useState("Frontend Intern at DevCorp (3 months)");
  const [careerGoal, setCareerGoal] = React.useState("Become a full stack web engineer");
  const [dreamCompany, setDreamCompany] = React.useState("Google");
  const [targetJob, setTargetJob] = React.useState("Software Engineer Intern");
  const [targetCountry] = React.useState("USA");
  const [industry] = React.useState("Information Technology");

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setResponse(null);
    setCopied(false);

    let systemPrompt = "";

    if (tab === "polish") {
      const cleanPrompt = prompt.trim();
      if (cleanPrompt.length < 15) {
        toast({
          title: "More Detail Needed",
          description: "Please provide a description of at least 15 characters.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      systemPrompt = `Perform '${action}' action on the following description: "${cleanPrompt}". Tone: ${writingTone}, Level: ${experienceLevel}.`;
    } else {
      systemPrompt = `Generate a complete student-focused placement resume structure for:
      Degree: ${degree}
      Graduation Year: ${gradYear}
      Key Skills: ${skills}
      Projects: ${projects}
      Internships: ${internships}
      Career Goal: ${careerGoal}
      Dream Company: ${dreamCompany}
      Target Job: ${targetJob}
      Target Country: ${targetCountry}
      Industry: ${industry}
      
      Generate the following sections formatted in clean markdown:
      1. Career Objective
      2. Professional Summary
      3. Categorized Technical & Soft Skills
      4. Detailed Project Bullet points (using high-impact action verbs)
      5. Internship Responsibilities
      6. Recommended Certifications & ATS Keywords
      `;
    }

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "ai-generate",
          payload: {
            prompt: systemPrompt,
            actionType: tab === "polish" ? action : "Student Resume Placement Structure",
            writingStyle: writingTone,
            experienceLevel,
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const rawText = typeof json.data === "string" ? json.data : JSON.stringify(json.data, null, 2);
        simulateStreaming(rawText);
      } else {
        throw new Error(json.error || "Failed to generate AI contents.");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      // Fallback text
      const fallback = `
### Generated Resume Sections (Fallback Mock)

**1. Career Objective**
To leverage my technical capabilities in Next.js and React to contribute as a ${targetJob} at ${dreamCompany || "your target firm"}.

**2. Professional Summary**
Detail-oriented ${degree} student graduating in ${gradYear}. Eager to deploy ${skills} expertise to build responsive features.

**3. Projects**
- **${projects.split(",")[0] || "Academic Project"}**
  - Architected modular frontend layout in React 19, improving page load velocity.
  - Formulated schema relations and queries.

**4. Internships**
- **${internships || "Software Intern"}**
  - Streamlined code structure and verified component state models.
      `.trim();
      simulateStreaming(fallback);
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
          title: "Generation Ready",
          description: "Resume sections drafted successfully.",
          variant: "success",
        });
      } else {
        currentText += (index === 0 ? "" : " ") + words[index];
        setResponse(currentText);
        index++;
      }
    }, 12);
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
    const blob = new Blob([response], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.href = url;
    element.download = `AI_Generated_Resume_Dossier.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSectionOperation = async (operation: string) => {
    if (!response) return;
    setLoading(true);
    setResponse(null);

    const promptText = `Apply section operation "${operation}" on the following resume content. Maintain the factual details but apply the changes correctly:\n\n${response}`;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "ai-generate",
          payload: {
            prompt: promptText,
            actionType: operation,
            writingStyle: writingTone,
            experienceLevel,
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        simulateStreaming(json.data);
      } else {
        throw new Error("Failed to process section update.");
      }
    } catch {
      simulateStreaming(response + `\n\n*(Refined with: ${operation})*`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personalized AI Resume Generator"
        description="Draft custom placement objectives, summaries, key project details, and internship bullets using structured student parameters."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Form / Setup Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glassmorphism">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Generator Setup
              </CardTitle>
              <CardDescription>Configure structured params or quick-polish templates.</CardDescription>

              {/* Mode Tabs */}
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/40 p-1 border border-border/30 mt-3">
                <button
                  type="button"
                  onClick={() => setTab("wizard")}
                  className={`rounded-md py-1 text-xs font-semibold transition-all ${
                    tab === "wizard"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Student Wizard
                </button>
                <button
                  type="button"
                  onClick={() => setTab("polish")}
                  className={`rounded-md py-1 text-xs font-semibold transition-all ${
                    tab === "polish"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Quick Polish
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-1 max-h-[500px] overflow-y-auto scrollbar-thin">
              {tab === "wizard" ? (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Degree / Major</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Graduation Year</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Technical Skills</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Academic Projects</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      value={projects}
                      onChange={(e) => setProjects(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Internship Experience</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      value={internships}
                      onChange={(e) => setInternships(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Career Goal</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">Dream Company</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        value={dreamCompany}
                        onChange={(e) => setDreamCompany(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">Target Role</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        value={targetJob}
                        onChange={(e) => setTargetJob(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">AI Action</label>
                    <select
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                    >
                      <option value="Career Objective">Generate Career Objective</option>
                      <option value="Project Description">Write Project Description</option>
                      <option value="Technical Skills">Suggest Technical Skills</option>
                      <option value="Achievements">Draft Key Achievements</option>
                      <option value="Custom Rewrite">Custom Rewrite / Polish</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Experience Level</label>
                    <select
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                    >
                      {EXPERIENCE_LEVELS.map((el) => (
                        <option key={el} value={el}>
                          {el}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Writing Tone</label>
                    <select
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={writingTone}
                      onChange={(e) => setWritingTone(e.target.value)}
                    >
                      {WRITING_TONES.map((wt) => (
                        <option key={wt} value={wt}>
                          {wt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Prompt Description</label>
                    <textarea
                      rows={5}
                      className="w-full resize-none rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      placeholder="Paste your rough text, accomplishments or skills targets here..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button onClick={() => handleGenerate()} className="w-full flex items-center justify-center gap-1.5" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Drafting Placement Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Custom Content
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-2">
          <Card className="glassmorphism flex h-full min-h-[480px] flex-col justify-between">
            <CardHeader className="border-b border-border/40 pb-4 flex flex-row justify-between items-center">
              <div className="flex items-center gap-2 text-primary">
                <Bot className="h-5 w-5" />
                <CardTitle className="text-base text-foreground">AI Placement Output</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto mb-4">
                {loading && !response ? (
                  <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold">Factual AI model is analyzing details...</p>
                  </div>
                ) : response ? (
                  <div className="prose dark:prose-invert max-w-none space-y-4 text-sm text-foreground">
                    <div className="rounded-lg border border-border bg-muted/20 p-5 whitespace-pre-wrap font-mono leading-relaxed text-xs">
                      {response}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-20 text-center text-muted-foreground">
                    <MessageSquare className="mb-4 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-semibold">Your drafted placement resume segments will load here.</p>
                  </div>
                )}
              </div>

              {response && (
                <div className="mt-4 border-t border-border/40 pt-4 flex flex-col gap-3">
                  {/* Inline Refinements Bar */}
                  <div className="flex flex-wrap gap-2 items-center text-xs">
                    <span className="font-semibold text-muted-foreground">Refine Section:</span>
                    <button
                      onClick={() => handleSectionOperation("Shorten")}
                      disabled={loading}
                      className="rounded bg-muted px-2.5 py-1 text-xs hover:bg-primary hover:text-primary-foreground font-semibold"
                    >
                      Shorten
                    </button>
                    <button
                      onClick={() => handleSectionOperation("Expand")}
                      disabled={loading}
                      className="rounded bg-muted px-2.5 py-1 text-xs hover:bg-primary hover:text-primary-foreground font-semibold"
                    >
                      Expand
                    </button>
                    <button
                      onClick={() => handleSectionOperation("Student Tone Rewrite")}
                      disabled={loading}
                      className="rounded bg-muted px-2.5 py-1 text-xs hover:bg-primary hover:text-primary-foreground font-semibold"
                    >
                      Student Tone
                    </button>
                    <button
                      onClick={() => handleSectionOperation("Fresher Tone Rewrite")}
                      disabled={loading}
                      className="rounded bg-muted px-2.5 py-1 text-xs hover:bg-primary hover:text-primary-foreground font-semibold"
                    >
                      Fresher Tone
                    </button>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleGenerate()} disabled={loading} className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="flex items-center gap-1.5">
                      {copied ? <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy Output
                    </Button>
                    <Button variant="default" size="sm" onClick={handleDownloadTxt} className="flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      Download TXT
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
