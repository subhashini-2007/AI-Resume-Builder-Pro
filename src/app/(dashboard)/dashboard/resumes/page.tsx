"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, LoadingState } from "@/components/shared/states";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, Plus, Trash2, Eye, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

interface ResumeItem {
  id: string;
  title: string;
  score: number;
  updatedAt: string;
  status: "Draft" | "Published";
}

interface DBExperienceItem {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isCurrent?: boolean;
  location?: string;
  order?: number;
}

interface DBEducationItem {
  school?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
  order?: number;
}

interface DBSkillItem {
  name: string;
  level?: string;
  category?: string;
  order?: number;
}

interface DBFullResume {
  title?: string;
  summary?: string;
  selectedTemplate?: string;
  experiences?: DBExperienceItem[];
  educations?: DBEducationItem[];
  skills?: DBSkillItem[];
}

export default function ResumesListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [resumes, setResumes] = React.useState<ResumeItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isActionInProgress, setIsActionInProgress] = React.useState(false);

  const fetchResumes = React.useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      const json = await res.json();
      if (json.success) {
        interface DBResumeItem {
          id: string;
          title?: string;
          status?: string;
          updatedAt: string;
          atsReports?: Array<{ score: number }>;
        }

        const items = (json.data.items || []).map((r: DBResumeItem) => ({
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
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleCreate = async () => {
    setIsActionInProgress(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "Draft Created",
          description: "A new resume draft has been successfully created.",
          variant: "success",
        });
        router.push(`/dashboard/resumes/create?id=${json.data.id}`);
      } else {
        throw new Error(json.error || "Failed to create draft");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create resume draft. Please try again.";
      toast({
        title: "Create Failed",
        description: message,
        variant: "destructive",
      });
      setIsActionInProgress(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume draft?")) return;
    setIsActionInProgress(true);
 
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "Resume Deleted",
          description: "The resume draft has been removed.",
          variant: "success",
        });
        await fetchResumes();
      } else {
        throw new Error(json.error || "Failed to delete");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not delete resume.";
      toast({
        title: "Delete Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setIsActionInProgress(true);
    try {
      // 1. Get original data
      const getRes = await fetch(`/api/resumes/${id}`);
      const getJson = await getRes.json();
      if (!getJson.success) {
        throw new Error(getJson.error || "Failed to fetch original resume data");
      }
      const origData = getJson.data as DBFullResume;

      // 2. Create new draft
      const createRes = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const createJson = await createRes.json();
      if (!createJson.success) {
        throw new Error(createJson.error || "Failed to initialize duplicate draft");
      }
      const newDraftId = createJson.data.id;

      // 3. Save cloned details into new draft
      const updateRes = await fetch(`/api/resumes/${newDraftId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${origData.title || "Untitled Resume"} (Copy)`,
          summary: origData.summary || "",
          selectedTemplate: origData.selectedTemplate || "ats-classic",
          status: "DRAFT",
          experiences: (origData.experiences || []).map((e: DBExperienceItem) => ({
            company: e.company || "",
            role: e.role || "",
            startDate: e.startDate || "",
            endDate: e.endDate || "",
            description: e.description || "",
            isCurrent: e.isCurrent || false,
            location: e.location || "",
            order: e.order || 0,
          })),
          educations: (origData.educations || []).map((edu: DBEducationItem) => ({
            school: edu.school || "",
            degree: edu.degree || "",
            fieldOfStudy: edu.fieldOfStudy || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            grade: edu.grade || "",
            description: edu.description || "",
            order: edu.order || 0,
          })),
          skills: (origData.skills || []).map((s: DBSkillItem) => ({
            name: s.name,
            level: s.level || "Intermediate",
            category: s.category || "",
            order: s.order || 0,
          })),
        }),
      });

      const updateJson = await updateRes.json();
      if (updateJson.success) {
        toast({
          title: "Resume Duplicated",
          description: `Created copy of "${origData.title || "Untitled Resume"}"`,
          variant: "success",
        });
        await fetchResumes();
      } else {
        throw new Error(updateJson.error || "Failed to save copied resume data");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to duplicate resume.";
      toast({
        title: "Duplicate Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="My Resumes"
          description="View, edit, and duplicate your professional resumes."
        />
        <LoadingState />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Resumes"
        description="View, edit, and duplicate your professional resumes. Test scores and manage versions."
      >
        <Button
          onClick={handleCreate}
          className="flex items-center gap-2"
          disabled={isActionInProgress}
        >
          <Plus className="h-4 w-4" />
          Create Resume
        </Button>
      </PageHeader>

      {/* Search Filter */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Filter resumes by name..."
          className="w-full rounded-md border border-border bg-background/50 py-2 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isActionInProgress}
        />
      </div>

      {/* Grid Resumes */}
      {filteredResumes.length === 0 ? (
        <EmptyState
          title="No resumes found"
          description="We couldn't find any resumes matching your search filters. Create one to get started."
          actionLabel="Create Resume"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResumes.map((resume) => (
            <Card key={resume.id} className="glassmorphism flex flex-col justify-between">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      resume.status === "Published"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {resume.status}
                  </span>
                </div>
                <CardTitle className="mt-4 text-base font-bold">{resume.title}</CardTitle>
                <CardDescription className="text-xs">Modified {resume.updatedAt}</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2 text-xs">
                  <span className="font-bold text-foreground">ATS Score:</span>
                  <span className="font-semibold text-primary">{resume.score}/100</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-border/20 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => router.push(`/dashboard/resumes/create?id=${resume.id}`)}
                  disabled={isActionInProgress}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/resumes/create?id=${resume.id}`)}
                    disabled={isActionInProgress}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(resume.id)}
                    disabled={isActionInProgress}
                    title="Duplicate Resume"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(resume.id)}
                    disabled={isActionInProgress}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
