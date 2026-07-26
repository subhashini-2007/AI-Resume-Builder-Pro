"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResumeTemplates, ResumeData } from "@/components/shared/resume-templates";
import { useToast } from "@/components/ui/toast";

const MAX_HISTORY = 50;
const TEMPLATES = [
  { id: "ats-classic", label: "ATS Classic" },
  { id: "modern", label: "Modern Layouts" },
  { id: "minimal", label: "Creative Minimalist" },
  { id: "executive", label: "Executive Serif" },
  { id: "creative", label: "Creative Accent" },
  { id: "corporate", label: "Corporate Navy" },
  { id: "elegant", label: "Elegant Amber" },
  { id: "compact", label: "Compact Standard" },
  { id: "student", label: "Student Entry" },
  { id: "developer", label: "Developer Terminal" },
];
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Undo,
  Redo,
  Save,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Eye,
  Camera,
  Bold,
  Italic,
  List,
  Download,
  RefreshCw,
  Printer,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { CharacterCounter } from "@/components/ui/character-counter";
import { FieldError } from "@/components/ui/field-error";
import {
  validateFullName,
  validateTitle,
  validateEmail,
  validatePhone,
  validateUrl,
  validateDate,
} from "@/lib/validation/client-validation";

interface DBExperience {
  id: string;
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface DBEducation {
  id: string;
  school?: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
}

interface DBSkill {
  name: string;
}

interface DBResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  avatar?: string;
  summary?: string;
  selectedTemplate?: string;
  experiences?: DBExperience[];
  educations?: DBEducation[];
  skills?: DBSkill[];
}

const INITIAL_DATA: ResumeData = {
  personalInfo: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    avatar: "",
    summary: "",
  },
  experiences: [],
  educations: [],
  skills: [],
};



export default function CreateResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { toast } = useToast();

  const [activeTab, setActiveTab] = React.useState<
    "personal" | "experience" | "education" | "skills"
  >("personal");
  const [selectedTemplate, setSelectedTemplate] = React.useState("ats-classic");
  const [showPreviewMobile, setShowPreviewMobile] = React.useState(false);
  const [isPageLoading, setIsPageLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = React.useRef(true);

  // Resume Data State
  const [data, setData] = React.useState<ResumeData>(INITIAL_DATA);
  const [history, setHistory] = React.useState<ResumeData[]>([]);
  const [redoStack, setRedoStack] = React.useState<ResumeData[]>([]);

  // Field validation and touched state
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const markTouched = React.useCallback((fieldKey: string) => {
    setTouched((prev) => (prev[fieldKey] ? prev : { ...prev, [fieldKey]: true }));
  }, []);

  const fullNameError = React.useMemo(
    () => (touched["fullName"] ? validateFullName(data.personalInfo.fullName) : null),
    [data.personalInfo.fullName, touched]
  );

  const titleError = React.useMemo(
    () => (touched["title"] ? validateTitle(data.personalInfo.title) : null),
    [data.personalInfo.title, touched]
  );

  const emailError = React.useMemo(
    () => (touched["email"] || data.personalInfo.email ? validateEmail(data.personalInfo.email) : null),
    [data.personalInfo.email, touched]
  );

  const phoneError = React.useMemo(
    () => (touched["phone"] || data.personalInfo.phone ? validatePhone(data.personalInfo.phone) : null),
    [data.personalInfo.phone, touched]
  );

  const websiteError = React.useMemo(
    () => (touched["website"] || data.personalInfo.website ? validateUrl(data.personalInfo.website, "Website") : null),
    [data.personalInfo.website, touched]
  );

  const hasValidationErrors = React.useMemo(() => {
    if (validateEmail(data.personalInfo.email)) return true;
    if (validatePhone(data.personalInfo.phone)) return true;
    if (validateUrl(data.personalInfo.website)) return true;
    if (data.personalInfo.summary.length > 500) return true;
    for (const exp of data.experiences) {
      if (validateDate(exp.startDate) || validateDate(exp.endDate)) return true;
      if (exp.description.length > 1000) return true;
    }
    for (const edu of data.educations) {
      if (validateDate(edu.startDate) || validateDate(edu.endDate)) return true;
    }
    return false;
  }, [data]);

  // 1. Force ID parameter redirect
  React.useEffect(() => {
    if (!id) {
      async function createDraft() {
        try {
          const res = await fetch("/api/resumes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const json = await res.json();
          if (json.success) {
            router.replace(`/dashboard/resumes/create?id=${json.data.id}`);
          }
        } catch (err) {
          console.error("Failed to create draft:", err);
        }
      }
      createDraft();
    }
  }, [id, router]);

  // 2. Fetch data from backend on load
  React.useEffect(() => {
    if (!id) return;
    async function loadResume() {
      try {
        setIsPageLoading(true);
        const res = await fetch(`/api/resumes/${id}`);
        const json = await res.json();
        if (json.success) {
          const fetched = json.data as DBResumeData;
          setData({
            personalInfo: {
              fullName: fetched.fullName || "",
              title: fetched.experiences?.[0]?.role || "",
              email: fetched.email || "",
              phone: fetched.phone || "",
              location: fetched.location || "",
              website: fetched.website || "",
              avatar: fetched.avatar || "",
              summary: fetched.summary || "",
            },
            experiences: (fetched.experiences || []).map((e: DBExperience) => ({
              id: e.id,
              company: e.company || "",
              role: e.role || "",
              startDate: e.startDate || "",
              endDate: e.endDate || "",
              description: e.description || "",
            })),
            educations: (fetched.educations || []).map((edu: DBEducation) => ({
              id: edu.id,
              school: edu.school || "",
              degree: edu.degree || "",
              startDate: edu.startDate || "",
              endDate: edu.endDate || "",
            })),
            skills: (fetched.skills || []).map((s: DBSkill) => s.name),
          });
          if (fetched.selectedTemplate) {
            setSelectedTemplate(fetched.selectedTemplate);
          }
        } else {
          toast({
            title: "Load Failed",
            description: json.error || "Could not retrieve resume details.",
            variant: "destructive",
          });
          router.push("/dashboard/resumes");
        }
      } catch (err) {
        console.error("Error loading resume:", err);
      } finally {
        setIsPageLoading(false);
      }
    }
    loadResume();
  }, [id, router, toast]);

  

  // Helper for shallow equality of ResumeData (covers personalInfo, experiences, educations, skills)
  const isResumeDataEqual = (a: ResumeData, b: ResumeData): boolean => {
    // PersonalInfo shallow compare
    const piKeys: (keyof typeof a.personalInfo)[] = [
      'fullName',
      'title',
      'email',
      'phone',
      'location',
      'website',
      'avatar',
      'summary',
    ];
    for (const key of piKeys) {
      if (a.personalInfo[key] !== b.personalInfo[key]) return false;
    }
    // Experiences compare (order matters)
    if (a.experiences.length !== b.experiences.length) return false;
    for (let i = 0; i < a.experiences.length; i++) {
      const ea = a.experiences[i];
      const eb = b.experiences[i];
      if (
        ea.id !== eb.id ||
        ea.company !== eb.company ||
        ea.role !== eb.role ||
        ea.startDate !== eb.startDate ||
        ea.endDate !== eb.endDate ||
        ea.description !== eb.description
      ) {
        return false;
      }
    }
    // Educations compare
    if (a.educations.length !== b.educations.length) return false;
    for (let i = 0; i < a.educations.length; i++) {
      const ea = a.educations[i];
      const eb = b.educations[i];
      if (
        ea.id !== eb.id ||
        ea.school !== eb.school ||
        ea.degree !== eb.degree ||
        ea.startDate !== eb.startDate ||
        ea.endDate !== eb.endDate
      ) {
        return false;
      }
    }
    // Skills compare (array of strings)
    if (a.skills.length !== b.skills.length) return false;
    for (let i = 0; i < a.skills.length; i++) {
      if (a.skills[i] !== b.skills[i]) return false;
    }
    return true;
  };

  const updateData = (newData: ResumeData) => {
    // Avoid duplicate consecutive states using shallow equality
    if (isResumeDataEqual(data, newData)) {
      return; // No change, skip history entry
    }
    // Push previous state onto history, respecting max size
    setHistory((prev) => {
      const updated = [...prev, data];
      if (updated.length > MAX_HISTORY) {
        updated.shift(); // discard oldest
      }
      return updated;
    });
    // Clear redo stack on new edits
    setRedoStack([]);
    setData(newData);
  };

  // History Operations
  const handleUndo = React.useCallback(() => {
    if (history.length === 0) {
      toast({ title: "Undo History", description: "No actions left to undo." });
      return;
    }
    const previous = history[history.length - 1];
    setRedoStack((prev) => [data, ...prev]);
    setData(previous);
    setHistory((prev) => prev.slice(0, -1));
    toast({ title: "Undo Action", description: "Reverted your last edit." });
  }, [history, data, toast]);


  // Redo handling – restores a state without adding a new history entry
  const handleRedo = React.useCallback(() => {
    if (redoStack.length === 0) {
      toast({ title: "Redo History", description: "No actions left to redo." });
      return;
    }
    const next = redoStack[0];
    // Do not create a new history entry when redoing; simply move to next state
    setData(next);
    setRedoStack((prev) => prev.slice(1));
  }, [redoStack, toast]);

  // Base64 Photo Uploader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = {
        ...data,
        personalInfo: { ...data.personalInfo, avatar: reader.result as string },
      };
      updateData(updated);
      toast({
        title: "Photo Uploaded",
        description: "Avatar updated in preview.",
        variant: "success",
      });
    };
    reader.readAsDataURL(file);
  };

  // Rich-Text Toolbar Formatter
  const formatText = (
    field: "summary" | { type: "exp"; id: string },
    type: "bold" | "italic" | "list"
  ) => {
    let element: HTMLTextAreaElement | null = null;
    if (field === "summary") {
      element = document.getElementById("summary-textarea") as HTMLTextAreaElement;
    } else {
      element = document.getElementById(`exp-desc-${field.id}`) as HTMLTextAreaElement;
    }
    if (!element) return;

    const start = element.selectionStart;
    const end = element.selectionEnd;
    const text = element.value;
    const selected = text.substring(start, end);

    let formatted = "";
    if (type === "bold") formatted = `<b>${selected || "bold text"}</b>`;
    else if (type === "italic") formatted = `<i>${selected || "italic text"}</i>`;
    else if (type === "list") formatted = `\n• ${selected || "list item"}`;

    const newText = text.substring(0, start) + formatted + text.substring(end);

    if (field === "summary") {
      updateData({
        ...data,
        personalInfo: { ...data.personalInfo, summary: newText },
      });
    } else {
      const newExps = data.experiences.map((exp) =>
        exp.id === field.id ? { ...exp, description: newText } : exp
      );
      updateData({ ...data, experiences: newExps });
    }

    // Refocus
    setTimeout(() => {
      if (element) {
        element.focus();
        element.setSelectionRange(start, start + formatted.length);
      }
    }, 50);
  };

  // Experience array manipulation
  const addExperience = () => {
    const newExp = {
      id: Math.random().toString(36).substring(2, 9),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    updateData({ ...data, experiences: [...data.experiences, newExp] });
    toast({ title: "Experience Added", description: "New blank experience section added." });
  };

  const removeExperience = (expId: string) => {
    updateData({ ...data, experiences: data.experiences.filter((exp) => exp.id !== expId) });
    toast({ title: "Experience Removed", description: "Experience section deleted." });
  };

  const shiftExperience = (index: number, direction: "up" | "down") => {
    const list = [...data.experiences];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    updateData({ ...data, experiences: list });
  };

  // Education array manipulation
  const addEducation = () => {
    const newEdu = {
      id: Math.random().toString(36).substring(2, 9),
      school: "",
      degree: "",
      startDate: "",
      endDate: "",
    };
    updateData({ ...data, educations: [...data.educations, newEdu] });
  };

  const removeEducation = (eduId: string) => {
    updateData({ ...data, educations: data.educations.filter((edu) => edu.id !== eduId) });
  };

  const shiftEducation = (index: number, direction: "up" | "down") => {
    const list = [...data.educations];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    updateData({ ...data, educations: list });
  };

  // Skills string manipulation
  const addSkill = (skill: string) => {
    if (!skill.trim() || data.skills.includes(skill.trim())) return;
    updateData({ ...data, skills: [...data.skills, skill.trim()] });
  };

  const removeSkill = (skill: string) => {
    updateData({ ...data, skills: data.skills.filter((s) => s !== skill) });
  };

  // Manual save trigger
  const latestSaveId = React.useRef<number>(0);

  const autoSave = React.useCallback(async () => {
    if (!id) return;
    if (isSaving) return; // avoid overlapping saves
    if (hasValidationErrors) {
      setSaveStatus('error');
      return; // Never send invalid data to server
    }
    setIsSaving(true);
    setSaveStatus('saving');
    const currentId = ++latestSaveId.current;
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.personalInfo.fullName ? `${data.personalInfo.fullName} CV` : "Resume Draft",
          summary: data.personalInfo.summary || "",
          fullName: data.personalInfo.fullName || "",
          phone: data.personalInfo.phone || "",
          email: data.personalInfo.email || "",
          location: data.personalInfo.location || "",
          website: data.personalInfo.website || "",
          avatar: data.personalInfo.avatar || "",
          selectedTemplate: selectedTemplate || "ats-classic",
          status: "DRAFT",
          experiences: data.experiences.map((exp, idx) => ({
            company: exp.company || "",
            role: exp.role || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            description: exp.description || "",
            order: idx,
          })),
          educations: data.educations.map((edu, idx) => ({
            school: edu.school || "",
            degree: edu.degree || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            order: idx,
          })),
          skills: data.skills.map((skillName, idx) => ({
            name: skillName,
            order: idx,
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        if (currentId === latestSaveId.current) {
          setSaveStatus('saved');
        }
      } else {
        throw new Error(json.error || "Save failed");
      }
    } catch {
      if (currentId === latestSaveId.current) {
        setSaveStatus('error');
      }
    } finally {
      if (currentId === latestSaveId.current) {
        setIsSaving(false);
      }
    }
  }, [id, data, selectedTemplate, isSaving, hasValidationErrors]);


  // Auto-save effect - triggers after user stops typing (800-1200 ms)
  React.useEffect(() => {
    if (isInitialMount.current) {
      // Skip first render (initial data load)
      isInitialMount.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 1000); // 1 second debounce within required window
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, selectedTemplate, autoSave]);

  // Keyboard shortcuts for Undo/Redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
      if (!ctrlOrCmd) return;
      // Undo: Ctrl/Cmd + Z (without Shift)
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl/Cmd + Shift + Z OR Ctrl + Y
      if (
        (e.key.toLowerCase() === 'z' && e.shiftKey) ||
        (e.key.toLowerCase() === 'y' && !e.shiftKey && e.ctrlKey)
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [history, redoStack, handleUndo, handleRedo]);

  // Existing manual save handler (unchanged logic, but now also updates saveStatus)
  const handleSaveDraft = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.personalInfo.fullName ? `${data.personalInfo.fullName} CV` : "Resume Draft",
          summary: data.personalInfo.summary || "",
          fullName: data.personalInfo.fullName || "",
          phone: data.personalInfo.phone || "",
          email: data.personalInfo.email || "",
          location: data.personalInfo.location || "",
          website: data.personalInfo.website || "",
          avatar: data.personalInfo.avatar || "",
          selectedTemplate: selectedTemplate || "ats-classic",
          status: "DRAFT",
          experiences: data.experiences.map((exp, idx) => ({
            company: exp.company || "",
            role: exp.role || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            description: exp.description || "",
            order: idx,
          })),
          educations: data.educations.map((edu, idx) => ({
            school: edu.school || "",
            degree: edu.degree || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            order: idx,
          })),
          skills: data.skills.map((skillName, idx) => ({
            name: skillName,
            order: idx,
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "Draft Saved",
          description: "Resume successfully synced with cloud database.",
          variant: "success",
        });
        router.push("/dashboard/resumes");
      } else {
        throw new Error(json.error || "Save failed");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save draft to database.";
      toast({
        title: "Save Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${data.personalInfo.fullName || "resume"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast({
      title: "JSON Exported",
      description: "Resume profile data downloaded successfully.",
      variant: "success",
    });
  };

  if (isPageLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Loading Resume Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      {/* Print CSS Override */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-resume-container,
          .printable-resume-container * {
            visibility: visible;
          }
          .printable-resume-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <PageHeader
        title="Resume Editor"
        description="Edit your resume content in real-time, test template styles, and review formatting."
        className="mb-4 pb-4"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleUndo} title="Undo" disabled={history.length === 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo} title="Redo" disabled={redoStack.length === 0}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJson} title="Export JSON">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} title="Print/Export PDF">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="default" size="sm" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save & Close
              </>
            )}
          </Button>
          {/* Save status indicator */}
          {saveStatus === 'saving' && <span className="ml-2 text-sm text-muted-foreground">Saving...</span>}
          {saveStatus === 'saved' && <span className="ml-2 text-sm text-success-foreground">Saved</span>}
          {saveStatus === 'error' && <span className="ml-2 text-sm text-destructive-foreground">Failed to save</span>}
          {/* Mobile Preview Toggle */}
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1.5 md:hidden"
            onClick={() => setShowPreviewMobile(!showPreviewMobile)}
          >
            {showPreviewMobile ? (
              <>
                <FileText className="h-4 w-4" />
                Edit Info
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Preview
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      {/* Editor Content Area */}
      <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden md:grid-cols-2">
        {/* Left Side: Editor Form */}
        <div
          className={cn(
            "flex flex-col space-y-4 overflow-y-auto pr-2",
            showPreviewMobile ? "hidden md:flex" : "flex"
          )}
        >
          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto border-b border-border/40 pb-2">
            {(["personal", "experience", "education", "skills"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="min-h-[300px] flex-1">
            {/* Tab 1: Personal Details */}
            {activeTab === "personal" && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <User className="h-4 w-4 text-primary" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Photo Upload */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30">
                      {data.personalInfo.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={data.personalInfo.avatar}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("avatar-upload")?.click()}
                      >
                        Upload Profile Photo
                      </Button>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Accepts PNG, JPG formats
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        aria-invalid={!!fullNameError}
                        aria-describedby={fullNameError ? "fullName-error" : undefined}
                        onBlur={() => markTouched("fullName")}
                        className={cn(
                          "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                          fullNameError
                            ? "border-destructive focus:border-destructive text-destructive"
                            : "border-border focus:border-primary"
                        )}
                        value={data.personalInfo.fullName}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, fullName: e.target.value },
                          })
                        }
                      />
                      <FieldError id="fullName-error" error={fullNameError} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        aria-invalid={!!titleError}
                        aria-describedby={titleError ? "title-error" : undefined}
                        onBlur={() => markTouched("title")}
                        className={cn(
                          "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                          titleError
                            ? "border-destructive focus:border-destructive text-destructive"
                            : "border-border focus:border-primary"
                        )}
                        value={data.personalInfo.title}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, title: e.target.value },
                          })
                        }
                      />
                      <FieldError id="title-error" error={titleError} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Email</label>
                      <input
                        type="email"
                        id="email"
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? "email-error" : undefined}
                        onBlur={() => markTouched("email")}
                        className={cn(
                          "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                          emailError
                            ? "border-destructive focus:border-destructive text-destructive"
                            : "border-border focus:border-primary"
                        )}
                        value={data.personalInfo.email}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, email: e.target.value },
                          })
                        }
                      />
                      <FieldError id="email-error" error={emailError} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                      <input
                        type="text"
                        id="phone"
                        aria-invalid={!!phoneError}
                        aria-describedby={phoneError ? "phone-error" : undefined}
                        onBlur={() => markTouched("phone")}
                        className={cn(
                          "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                          phoneError
                            ? "border-destructive focus:border-destructive text-destructive"
                            : "border-border focus:border-primary"
                        )}
                        value={data.personalInfo.phone}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, phone: e.target.value },
                          })
                        }
                      />
                      <FieldError id="phone-error" error={phoneError} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.location}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, location: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Website / Link
                      </label>
                      <input
                        type="text"
                        id="website"
                        aria-invalid={!!websiteError}
                        aria-describedby={websiteError ? "website-error" : undefined}
                        onBlur={() => markTouched("website")}
                        className={cn(
                          "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                          websiteError
                            ? "border-destructive focus:border-destructive text-destructive"
                            : "border-border focus:border-primary"
                        )}
                        value={data.personalInfo.website}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, website: e.target.value },
                          })
                        }
                      />
                      <FieldError id="website-error" error={websiteError} />
                    </div>
                  </div>

                  {/* Summary Textarea with Toolbar & Real-Time Character Counter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Professional Summary
                      </label>
                      <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5">
                        <button
                          type="button"
                          onClick={() => formatText("summary", "bold")}
                          className="rounded p-1 text-muted-foreground hover:bg-muted"
                        >
                          <Bold className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText("summary", "italic")}
                          className="rounded p-1 text-muted-foreground hover:bg-muted"
                        >
                          <Italic className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText("summary", "list")}
                          className="rounded p-1 text-muted-foreground hover:bg-muted"
                        >
                          <List className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      id="summary-textarea"
                      rows={5}
                      aria-invalid={data.personalInfo.summary.length > 500}
                      aria-describedby="summary-char-counter"
                      className={cn(
                        "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                        data.personalInfo.summary.length > 500
                          ? "border-destructive focus:border-destructive"
                          : "border-border focus:border-primary"
                      )}
                      value={data.personalInfo.summary}
                      onChange={(e) =>
                        updateData({
                          ...data,
                          personalInfo: { ...data.personalInfo, summary: e.target.value },
                        })
                      }
                    />
                    <CharacterCounter
                      id="summary-char-counter"
                      currentLength={data.personalInfo.summary.length}
                      maxLength={500}
                      recommendedRange={[200, 500]}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab 2: Work Experience */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                {data.experiences.map((exp, idx) => (
                  <Card key={exp.id} className="glassmorphism">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/20 py-4">
                      <CardTitle className="flex items-center gap-2 text-xs font-bold">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Experience #{idx + 1}
                      </CardTitle>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => shiftExperience(idx, "up")}
                          className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === data.experiences.length - 1}
                          onClick={() => shiftExperience(idx, "down")}
                          className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="rounded p-1 text-destructive hover:bg-muted"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Company
                          </label>
                          <input
                            type="text"
                            id={`exp-company-${exp.id}`}
                            aria-invalid={touched[`exp-company-${exp.id}`] && !exp.company.trim()}
                            aria-describedby={`exp-company-${exp.id}-error`}
                            onBlur={() => markTouched(`exp-company-${exp.id}`)}
                            className={cn(
                              "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                              touched[`exp-company-${exp.id}`] && !exp.company.trim()
                                ? "border-destructive focus:border-destructive text-destructive"
                                : "border-border focus:border-primary"
                            )}
                            value={exp.company}
                            onChange={(e) => {
                              const newExps = data.experiences.map((item) =>
                                item.id === exp.id ? { ...item, company: e.target.value } : item
                              );
                              updateData({ ...data, experiences: newExps });
                            }}
                          />
                          <FieldError
                            id={`exp-company-${exp.id}-error`}
                            error={
                              touched[`exp-company-${exp.id}`] && !exp.company.trim()
                                ? "Company name is required."
                                : null
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Role / Position
                          </label>
                          <input
                            type="text"
                            id={`exp-role-${exp.id}`}
                            aria-invalid={touched[`exp-role-${exp.id}`] && !exp.role.trim()}
                            aria-describedby={`exp-role-${exp.id}-error`}
                            onBlur={() => markTouched(`exp-role-${exp.id}`)}
                            className={cn(
                              "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                              touched[`exp-role-${exp.id}`] && !exp.role.trim()
                                ? "border-destructive focus:border-destructive text-destructive"
                                : "border-border focus:border-primary"
                            )}
                            value={exp.role}
                            onChange={(e) => {
                              const newExps = data.experiences.map((item) =>
                                item.id === exp.id ? { ...item, role: e.target.value } : item
                              );
                              updateData({ ...data, experiences: newExps });
                            }}
                          />
                          <FieldError
                            id={`exp-role-${exp.id}-error`}
                            error={
                              touched[`exp-role-${exp.id}`] && !exp.role.trim()
                                ? "Role / Position is required."
                                : null
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Start Date
                          </label>
                          <input
                            type="text"
                            id={`exp-start-${exp.id}`}
                            placeholder="E.g. Jan 2021"
                            aria-invalid={!!validateDate(exp.startDate)}
                            aria-describedby={`exp-start-${exp.id}-error`}
                            className={cn(
                              "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                              validateDate(exp.startDate)
                                ? "border-destructive focus:border-destructive text-destructive"
                                : "border-border focus:border-primary"
                            )}
                            value={exp.startDate}
                            onChange={(e) => {
                              const newExps = data.experiences.map((item) =>
                                item.id === exp.id ? { ...item, startDate: e.target.value } : item
                              );
                              updateData({ ...data, experiences: newExps });
                            }}
                          />
                          <FieldError
                            id={`exp-start-${exp.id}-error`}
                            error={validateDate(exp.startDate)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            End Date
                          </label>
                          <input
                            type="text"
                            id={`exp-end-${exp.id}`}
                            placeholder="E.g. Present"
                            aria-invalid={!!validateDate(exp.endDate)}
                            aria-describedby={`exp-end-${exp.id}-error`}
                            className={cn(
                              "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                              validateDate(exp.endDate)
                                ? "border-destructive focus:border-destructive text-destructive"
                                : "border-border focus:border-primary"
                            )}
                            value={exp.endDate}
                            onChange={(e) => {
                              const newExps = data.experiences.map((item) =>
                                item.id === exp.id ? { ...item, endDate: e.target.value } : item
                              );
                              updateData({ ...data, experiences: newExps });
                            }}
                          />
                          <FieldError
                            id={`exp-end-${exp.id}-error`}
                            error={validateDate(exp.endDate)}
                          />
                        </div>
                      </div>

                      {/* Experience bullet descriptions */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Key Contributions
                          </label>
                          <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5">
                            <button
                              type="button"
                              onClick={() => formatText({ type: "exp", id: exp.id }, "bold")}
                              className="rounded p-1 text-muted-foreground hover:bg-muted"
                            >
                              <Bold className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => formatText({ type: "exp", id: exp.id }, "italic")}
                              className="rounded p-1 text-muted-foreground hover:bg-muted"
                            >
                              <Italic className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => formatText({ type: "exp", id: exp.id }, "list")}
                              className="rounded p-1 text-muted-foreground hover:bg-muted"
                            >
                              <List className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <textarea
                          id={`exp-desc-${exp.id}`}
                          rows={4}
                          aria-invalid={exp.description.length > 1000}
                          aria-describedby={`exp-${exp.id}-char-counter`}
                          className={cn(
                            "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                            exp.description.length > 1000
                              ? "border-destructive focus:border-destructive text-destructive"
                              : "border-border focus:border-primary"
                          )}
                          value={exp.description}
                          onChange={(e) => {
                            const newExps = data.experiences.map((item) =>
                              item.id === exp.id ? { ...item, description: e.target.value } : item
                            );
                            updateData({ ...data, experiences: newExps });
                          }}
                        />
                        <CharacterCounter
                          id={`exp-${exp.id}-char-counter`}
                          currentLength={exp.description.length}
                          maxLength={1000}
                          recommendedRange={[100, 300]}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={addExperience}>
                  <Plus className="mr-2 h-4 w-4" /> Add Experience Section
                </Button>
              </div>
            )}

            {/* Tab 3: Education */}
            {activeTab === "education" && (
              <div className="space-y-4">
                {data.educations.map((edu, idx) => (
                  <Card key={edu.id} className="glassmorphism">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/20 py-4">
                      <CardTitle className="flex items-center gap-2 text-xs font-bold">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Education #{idx + 1}
                      </CardTitle>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => shiftEducation(idx, "up")}
                          className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === data.educations.length - 1}
                          onClick={() => shiftEducation(idx, "down")}
                          className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEducation(edu.id)}
                          className="rounded p-1 text-destructive hover:bg-muted"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            School / University
                          </label>
                          <input
                            type="text"
                            id={`edu-school-${edu.id}`}
                            aria-invalid={touched[`edu-school-${edu.id}`] && !edu.school.trim()}
                            aria-describedby={`edu-school-${edu.id}-error`}
                            onBlur={() => markTouched(`edu-school-${edu.id}`)}
                            className={cn(
                              "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                              touched[`edu-school-${edu.id}`] && !edu.school.trim()
                                ? "border-destructive focus:border-destructive text-destructive"
                                : "border-border focus:border-primary"
                            )}
                            value={edu.school}
                            onChange={(e) => {
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, school: e.target.value } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                          <FieldError
                            id={`edu-school-${edu.id}-error`}
                            error={
                              touched[`edu-school-${edu.id}`] && !edu.school.trim()
                                ? "School / University is required."
                                : null
                            }
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Degree / Major
                          </label>
                          <input
                            type="text"
                            id={`edu-degree-${edu.id}`}
                            aria-invalid={touched[`edu-degree-${edu.id}`] && !edu.degree.trim()}
                            aria-describedby={`edu-degree-${edu.id}-error`}
                            onBlur={() => markTouched(`edu-degree-${edu.id}`)}
                            className={cn(
                              "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                              touched[`edu-degree-${edu.id}`] && !edu.degree.trim()
                                ? "border-destructive focus:border-destructive text-destructive"
                                : "border-border focus:border-primary"
                            )}
                            value={edu.degree}
                            onChange={(e) => {
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, degree: e.target.value } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                          <FieldError
                            id={`edu-degree-${edu.id}-error`}
                            error={
                              touched[`edu-degree-${edu.id}`] && !edu.degree.trim()
                                ? "Degree / Major is required."
                                : null
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Start Year
                          </label>
                          <input
                            type="text"
                            id={`edu-start-${edu.id}`}
                            placeholder="E.g. 2017"
                            aria-invalid={!!validateDate(edu.startDate)}
                            aria-describedby={`edu-start-${edu.id}-error`}
                            className={cn(
                              "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                              validateDate(edu.startDate)
                                ? "border-destructive focus:border-destructive text-destructive"
                                : "border-border focus:border-primary"
                            )}
                            value={edu.startDate}
                            onChange={(e) => {
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, startDate: e.target.value } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                          <FieldError
                            id={`edu-start-${edu.id}-error`}
                            error={validateDate(edu.startDate)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Graduation Year
                          </label>
                          <input
                            type="text"
                            id={`edu-end-${edu.id}`}
                            placeholder="E.g. 2021"
                            aria-invalid={!!validateDate(edu.endDate)}
                            aria-describedby={`edu-end-${edu.id}-error`}
                            className={cn(
                              "w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none",
                              validateDate(edu.endDate)
                                ? "border-destructive focus:border-destructive text-destructive"
                                : "border-border focus:border-primary"
                            )}
                            value={edu.endDate}
                            onChange={(e) => {
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, endDate: e.target.value } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                          <FieldError
                            id={`edu-end-${edu.id}-error`}
                            error={validateDate(edu.endDate)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={addEducation}>
                  <Plus className="mr-2 h-4 w-4" /> Add Education Section
                </Button>
              </div>
            )}

            {/* Tab 4: Skills Array */}
            {activeTab === "skills" && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Sparkles className="h-4.5 w-4.5 text-primary" />
                    Skills toolbox
                  </CardTitle>
                  <CardDescription>Add keywords that match job descriptions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Skill Add Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="skill-adder-input"
                      placeholder="E.g. Next.js 15"
                      className="flex-1 rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value;
                          addSkill(val);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("skill-adder-input") as HTMLInputElement;
                        addSkill(el.value);
                        el.value = "";
                      }}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Active Skills tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {data.skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {s}
                        <button
                          type="button"
                          className="text-[10px] transition-colors hover:text-destructive"
                          onClick={() => removeSkill(s)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Side: Live Resume Preview */}
        <div
          className={cn(
            "flex flex-col space-y-4 overflow-y-auto pl-2",
            showPreviewMobile ? "flex" : "hidden md:flex"
          )}
        >
          {/* Template category bar */}
          <div className="flex w-full gap-2 overflow-x-auto border-b border-border/40 pb-2">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                  selectedTemplate === tmpl.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          {/* Template Renderer Container */}
          <div className="flex min-h-[450px] w-full flex-1 items-center justify-center rounded-2xl border border-border/40 bg-muted/20 p-4">
            <div className="printable-resume-container w-full max-w-full">
              <ResumeTemplates
                templateId={selectedTemplate}
                data={data}
                className="w-full max-w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
