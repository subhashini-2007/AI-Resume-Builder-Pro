"use client";


import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResumeTemplates, ResumeData, ResumeCustomization } from "@/components/shared/resume-templates";
import { useToast } from "@/components/ui/toast";
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
  GripVertical,
  History,
  Globe,
  Copy,
  Award,
  Palette,
  CheckCircle,
  Activity,
  BookOpen,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

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
  fieldOfStudy?: string;
  grade?: string;
}

interface DBSkill {
  name: string;
}

interface DBProject {
  id?: string;
  name?: string;
  description?: string;
  role?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  projectType?: string;
  duration?: string;
  technologies?: string;
  responsibilities?: string;
  keyFeatures?: string[];
  achievements?: string[];
  githubUrl?: string;
  liveUrl?: string;
  documentationUrl?: string;
  teamSize?: string;
  clientName?: string;
  status?: string;
}

interface DBCertification {
  id?: string;
  name?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  url?: string;
}

interface DBLanguage {
  id?: string;
  name?: string;
  proficiency?: string;
}

interface DBAward {
  id?: string;
  title?: string;
  issuer?: string;
  date?: string;
  description?: string;
}

interface DBInterest {
  id?: string;
  name?: string;
}

interface DBReference {
  id?: string;
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
}

interface DBResumeData {
  id?: string;
  fullName?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  leetcodeUrl?: string;
  hackerrankUrl?: string;
  kaggleUrl?: string;
  mediumUrl?: string;
  stackoverflowUrl?: string;
  behanceUrl?: string;
  dribbbleUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  devtoUrl?: string;
  researchgateUrl?: string;
  orcidUrl?: string;
  googleScholarUrl?: string;
  otherLinkLabel?: string;
  otherLinkUrl?: string;
  avatar?: string;
  summary?: string;
  selectedTemplate?: string;
  experiences?: DBExperience[];
  educations?: DBEducation[];
  skills?: DBSkill[];
  projects?: DBProject[];
  certifications?: DBCertification[];
  languages?: DBLanguage[];
  awards?: DBAward[];
  interests?: DBInterest[];
  references?: DBReference[];
}

interface DBVersionItem {
  id: string;
  resumeId: string;
  title: string;
  data: DBResumeData;
  createdAt: string;
  updatedAt: string;
}

const INITIAL_DATA: ResumeData = {
  personalInfo: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    leetcodeUrl: "",
    hackerrankUrl: "",
    kaggleUrl: "",
    mediumUrl: "",
    stackoverflowUrl: "",
    behanceUrl: "",
    dribbbleUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    devtoUrl: "",
    researchgateUrl: "",
    orcidUrl: "",
    googleScholarUrl: "",
    otherLinkLabel: "",
    otherLinkUrl: "",
    avatar: "",
    summary: "",
  },
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  interests: [],
  references: [],
};

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

export default function CreateResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { toast } = useToast();

  const [activeTab, setActiveTab] = React.useState<
    | "personal"
    | "profiles"
    | "education"
    | "skills"
    | "projects"
    | "internships"
    | "certifications"
    | "achievements"
    | "extracurricular"
    | "experience"
    | "customization"
    | "history"
  >("personal");
  const [selectedTemplate, setSelectedTemplate] = React.useState("ats-classic");
  const [customization, setCustomization] = React.useState<ResumeCustomization>({
    fontFamily: "sans",
    fontSize: "md",
    lineSpacing: "normal",
    margins: "normal",
    themeColor: "#2563eb",
  });
  const [showPreviewMobile, setShowPreviewMobile] = React.useState(false);
  const [isPageLoading, setIsPageLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [collapsedProjects, setCollapsedProjects] = React.useState<Record<string, boolean>>({});

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [draggedType, setDraggedType] = React.useState<"experience" | "education" | "project" | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number, type: "experience" | "education" | "project") => {
    setDraggedIndex(index);
    setDraggedType(type);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number, type: "experience" | "education" | "project") => {
    e.preventDefault();
    if (draggedIndex === null || draggedType !== type || draggedIndex === index) return;

    if (type === "experience") {
      const list = [...data.experiences];
      const draggedItem = list[draggedIndex];
      list.splice(draggedIndex, 1);
      list.splice(index, 0, draggedItem);
      setDraggedIndex(index);
      updateData({ ...data, experiences: list });
    } else if (type === "education") {
      const list = [...data.educations];
      const draggedItem = list[draggedIndex];
      list.splice(draggedIndex, 1);
      list.splice(index, 0, draggedItem);
      setDraggedIndex(index);
      updateData({ ...data, educations: list });
    } else if (type === "project") {
      const list = [...(data.projects || [])];
      const draggedItem = list[draggedIndex];
      list.splice(draggedIndex, 1);
      list.splice(index, 0, draggedItem);
      setDraggedIndex(index);
      updateData({ ...data, projects: list });
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedType(null);
  };

  // Resume Data State
  const [data, setData] = React.useState<ResumeData>(INITIAL_DATA);
  const [history, setHistory] = React.useState<ResumeData[]>([]);
  const [redoStack, setRedoStack] = React.useState<ResumeData[]>([]);
  // Version history database states
  const [dbVersions, setDbVersions] = React.useState<DBVersionItem[]>([]);
  const [isVersionsLoading, setIsVersionsLoading] = React.useState(false);
  const [newVersionTitle, setNewVersionTitle] = React.useState("");
  const [compareSourceVersionId, setCompareSourceVersionId] = React.useState<string | null>(null);
  const [compareTargetVersionId, setCompareTargetVersionId] = React.useState<string | null>(null);

  const computedSuggestions = React.useMemo(() => {
    const list: string[] = [];
    
    // 1. Weak summary
    if (!data.personalInfo.summary || data.personalInfo.summary.length < 50) {
      list.push("Weak professional summary: make it longer and add your core placements target (e.g., Frontend Intern).");
    }

    // 2. Missing measurable achievements
    const allDescriptions = (data.personalInfo.summary || "") + " " +
      (data.experiences || []).map(e => e.description || "").join(" ") + " " +
      (data.projects || []).map(p => p.description || "").join(" ") + " " +
      (data.awards || []).map(a => a.description || "").join(" ");
    const hasNumbers = /[\d%]/.test(allDescriptions);
    if (!hasNumbers) {
      list.push("Missing measurable achievements: try adding percentages, metrics or ranks (e.g., 'improved by 25%').");
    }

    // 3. Missing technologies
    const missingTech = (data.projects || []).some(p => !p.technologies || p.technologies.trim().length === 0);
    if (missingTech || (data.projects || []).length === 0) {
      list.push("Missing project technologies: specify technologies used for each project to pass keyword scanning.");
    }

    // 4. Weak project descriptions
    const weakProj = (data.projects || []).some(p => !p.description || p.description.trim().length < 40);
    if (weakProj) {
      list.push("Weak project descriptions: expand descriptions to explain problem, architecture, challenges and libraries.");
    }

    // 5. Missing action verbs
    const actionVerbsRegex = /^(developed|built|architected|led|created|managed|designed|implemented|streamlined|formulated|compiled|optimized|engineered)/i;
    const missingActionVerbs = (data.projects || []).some(p => p.description && !actionVerbsRegex.test(p.description.trim()));
    if (missingActionVerbs) {
      list.push("Summary statement is too short or missing. Add 2-3 lines highlighting career goals and top skills.");
    }
    const hasMeasurable =
      data.personalInfo.summary.includes("%") ||
      data.personalInfo.summary.match(/\b\d+\b/) ||
      data.experiences.some(
        (e) => e.description.includes("%") || e.description.match(/\b\d+\b/)
      );
    if (!hasMeasurable) {
      list.push("Add metrics or numbers (e.g. 'improved efficiency by 15%', 'won 2nd place out of 50 teams') to stand out.");
    }
    const actionVerbs = ["led", "developed", "built", "created", "managed", "designed", "optimized", "implemented", "achieved"];
    const hasAction = data.experiences.some((e) =>
      actionVerbs.some((v) => e.description.toLowerCase().includes(v))
    );
    if (!hasAction && data.experiences.length > 0) {
      list.push("Start experience descriptions with action verbs (e.g. Built, Optimized, Led) rather than passive voice.");
    }
    (data.projects || []).forEach((p) => {
      if (!p.technologies) {
        list.push(`Project "${p.name || 'Untitled'}" is missing technologies used. List tools like React, Node, Python.`);
      }
    });
    return list;
  }, [data]);

  const fetchDbVersions = React.useCallback(async () => {
    if (!id) return;
    setIsVersionsLoading(true);
    try {
      const res = await fetch(`/api/resumes/${id}/versions`);
      const json = await res.json();
      if (json.success) {
        setDbVersions(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load versions:", err);
    } finally {
      setIsVersionsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    if (activeTab === "history") {
      fetchDbVersions();
    }
  }, [activeTab, fetchDbVersions]);

  // 1. Force ID parameter redirect
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get("id");
    if (urlId) return;

    if (!id) {
      async function createDraft() {
        try {
          setIsPageLoading(true);
          const res = await fetch("/api/resumes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const json = await res.json();
          if (json.success && json.data?.id) {
            router.replace(`/dashboard/resumes/create?id=${json.data.id}`);
          } else {
            toast({
              title: "Draft Creation Failed",
              description: json.error || "Please sign in or check your connection.",
              variant: "destructive",
            });
            router.push("/dashboard/resumes");
            setIsPageLoading(false);
          }
        } catch (err) {
          console.error("Failed to create draft:", err);
          toast({
            title: "Network Error",
            description: "Could not initialize resume draft. Redirecting to dashboard...",
            variant: "destructive",
          });
          router.push("/dashboard/resumes");
          setIsPageLoading(false);
        }
      }
      createDraft();
    }
  }, [id, router, toast]);

  // 2. Fetch data from backend on load
  React.useEffect(() => {
    if (!id) return;

    async function loadResume() {
      try {
        setIsPageLoading(true);
        const res = await fetch(`/api/resumes/${id}`);
        const json = await res.json();

        if (json.success && json.data) {
          const fetched = json.data as DBResumeData;
          setData({
            personalInfo: {
              fullName: fetched.fullName || "",
              title: fetched.title || fetched.experiences?.[0]?.role || "",
              email: fetched.email || "",
              phone: fetched.phone || "",
              location: fetched.location || "",
              website: fetched.website || "",
              linkedinUrl: fetched.linkedinUrl || "",
              githubUrl: fetched.githubUrl || "",
              portfolioUrl: fetched.portfolioUrl || "",
              leetcodeUrl: fetched.leetcodeUrl || "",
              hackerrankUrl: fetched.hackerrankUrl || "",
              kaggleUrl: fetched.kaggleUrl || "",
              mediumUrl: fetched.mediumUrl || "",
              stackoverflowUrl: fetched.stackoverflowUrl || "",
              behanceUrl: fetched.behanceUrl || "",
              dribbbleUrl: fetched.dribbbleUrl || "",
              twitterUrl: fetched.twitterUrl || "",
              youtubeUrl: fetched.youtubeUrl || "",
              devtoUrl: fetched.devtoUrl || "",
              researchgateUrl: fetched.researchgateUrl || "",
              orcidUrl: fetched.orcidUrl || "",
              googleScholarUrl: fetched.googleScholarUrl || "",
              otherLinkLabel: fetched.otherLinkLabel || "",
              otherLinkUrl: fetched.otherLinkUrl || "",
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
              fieldOfStudy: edu.fieldOfStudy || "",
              grade: edu.grade || "",
              startDate: edu.startDate || "",
              endDate: edu.endDate || "",
            })),
            skills: (fetched.skills || []).map((s: DBSkill) => s.name),
            projects: (fetched.projects || []).map((p: DBProject) => ({
              id: p.id,
              name: p.name || "",
              description: p.description || "",
              role: p.role || "",
              url: p.url || "",
              startDate: p.startDate || "",
              endDate: p.endDate || "",
              projectType: p.projectType || "Personal",
              duration: p.duration || "",
              technologies: p.technologies || "",
              responsibilities: p.responsibilities || "",
              keyFeatures: p.keyFeatures || [],
              achievements: p.achievements || [],
              githubUrl: p.githubUrl || "",
              liveUrl: p.liveUrl || "",
              documentationUrl: p.documentationUrl || "",
              teamSize: p.teamSize || "",
              clientName: p.clientName || "",
              status: p.status || "Completed",
            })),
            certifications: (fetched.certifications || []).map((c: DBCertification) => ({
              id: c.id || "",
              name: c.name || "",
              issuer: c.issuer || "",
              issueDate: c.issueDate || "",
              expiryDate: c.expiryDate || "",
              url: c.url || "",
            })),
            languages: (fetched.languages || []).map((l: DBLanguage) => ({
              id: l.id || "",
              name: l.name || "",
              proficiency: l.proficiency || "",
            })),
            awards: (fetched.awards || []).map((a: DBAward) => ({
              id: a.id || "",
              title: a.title || "",
              issuer: a.issuer || "",
              date: a.date || "",
              description: a.description || "",
            })),
            interests: (fetched.interests || []).map((i: DBInterest) => ({
              id: i.id || "",
              name: i.name || "",
            })),
            references: (fetched.references || []).map((r: DBReference) => ({
              id: r.id || "",
              name: r.name || "",
              title: r.title || "",
              company: r.company || "",
              email: r.email || "",
              phone: r.phone || "",
            })),
          });

          if (fetched.selectedTemplate) {
            const parts = fetched.selectedTemplate.split("?");
            setSelectedTemplate(parts[0]);
            if (parts[1]) {
              const params = new URLSearchParams(parts[1]);
              setCustomization({
                fontFamily: (params.get("fontFamily") as "sans" | "serif" | "mono") || "sans",
                fontSize: (params.get("fontSize") as "sm" | "md" | "lg") || "md",
                lineSpacing: (params.get("lineSpacing") as "tight" | "normal" | "loose") || "normal",
                margins: (params.get("margins") as "compact" | "normal" | "wide") || "normal",
                themeColor: params.get("themeColor") || "#2563eb",
              });
            }
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

  // 3. Debounced Autosave API call
  React.useEffect(() => {
    if (!id || isPageLoading) return;

    const delay = setTimeout(async () => {
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
            linkedinUrl: data.personalInfo.linkedinUrl || "",
            githubUrl: data.personalInfo.githubUrl || "",
            portfolioUrl: data.personalInfo.portfolioUrl || "",
            leetcodeUrl: data.personalInfo.leetcodeUrl || "",
            hackerrankUrl: data.personalInfo.hackerrankUrl || "",
            kaggleUrl: data.personalInfo.kaggleUrl || "",
            mediumUrl: data.personalInfo.mediumUrl || "",
            stackoverflowUrl: data.personalInfo.stackoverflowUrl || "",
            behanceUrl: data.personalInfo.behanceUrl || "",
            dribbbleUrl: data.personalInfo.dribbbleUrl || "",
            twitterUrl: data.personalInfo.twitterUrl || "",
            youtubeUrl: data.personalInfo.youtubeUrl || "",
            devtoUrl: data.personalInfo.devtoUrl || "",
            researchgateUrl: data.personalInfo.researchgateUrl || "",
            orcidUrl: data.personalInfo.orcidUrl || "",
            googleScholarUrl: data.personalInfo.googleScholarUrl || "",
            otherLinkLabel: data.personalInfo.otherLinkLabel || "",
            otherLinkUrl: data.personalInfo.otherLinkUrl || "",
            avatar: data.personalInfo.avatar || "",
            selectedTemplate: `${selectedTemplate}?fontFamily=${customization.fontFamily || "sans"}&fontSize=${customization.fontSize || "md"}&lineSpacing=${customization.lineSpacing || "normal"}&margins=${customization.margins || "normal"}&themeColor=${encodeURIComponent(customization.themeColor || "#2563eb")}`,
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
              fieldOfStudy: edu.fieldOfStudy || "",
              grade: edu.grade || "",
              startDate: edu.startDate || "",
              endDate: edu.endDate || "",
              order: idx,
            })),
            skills: data.skills.map((skillName, idx) => ({
              name: skillName,
              order: idx,
            })),
            projects: (data.projects || []).map((proj, idx) => ({
              name: proj.name || "",
              description: proj.description || "",
              role: proj.role || "",
              url: proj.url || "",
              startDate: proj.startDate || "",
              endDate: proj.endDate || "",
              projectType: proj.projectType || "Personal",
              duration: proj.duration || "",
              technologies: proj.technologies || "",
              responsibilities: proj.responsibilities || "",
              keyFeatures: proj.keyFeatures || [],
              achievements: proj.achievements || [],
              githubUrl: proj.githubUrl || "",
              liveUrl: proj.liveUrl || "",
              documentationUrl: proj.documentationUrl || "",
              teamSize: proj.teamSize || "",
              clientName: proj.clientName || "",
              status: proj.status || "Completed",
              order: idx,
            })),
            certifications: (data.certifications || []).map((c, idx) => ({
              name: c.name || "",
              issuer: c.issuer || "",
              issueDate: c.issueDate || "",
              expiryDate: c.expiryDate || "",
              url: c.url || "",
              order: idx,
            })),
            languages: (data.languages || []).map((l, idx) => ({
              name: l.name || "",
              proficiency: l.proficiency || "",
              order: idx,
            })),
            awards: (data.awards || []).map((a, idx) => ({
              title: a.title || "",
              issuer: a.issuer || "",
              date: a.date || "",
              description: a.description || "",
              order: idx,
            })),
            interests: (data.interests || []).map((i, idx) => ({
              name: i.name || "",
              order: idx,
            })),
            references: (data.references || []).map((r, idx) => ({
              name: r.name || "",
              title: r.title || "",
              company: r.company || "",
              email: r.email || "",
              phone: r.phone || "",
              order: idx,
            })),
          }),
        });
        const json = await res.json();
        if (!json.success) {
          console.error("Autosave backend error:", json.error);
        }
      } catch (err) {
        console.error("Autosave network error:", err);
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(delay);
  }, [data, selectedTemplate, customization, id, isPageLoading]);

  const updateData = (newData: ResumeData) => {
    setHistory((prev) => [...prev, data]);
    setRedoStack([]);
    setData(newData);
  };

  // History Operations
  const handleUndo = () => {
    if (history.length === 0) {
      toast({ title: "Undo History", description: "No actions left to undo." });
      return;
    }
    const previous = history[history.length - 1];
    setRedoStack((prev) => [data, ...prev]);
    setData(previous);
    setHistory((prev) => prev.slice(0, -1));
    toast({ title: "Undo Action", description: "Reverted your last edit." });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) {
      toast({ title: "Redo History", description: "No actions left to redo." });
      return;
    }
    const next = redoStack[0];
    setHistory((prev) => [...prev, data]);
    setData(next);
    setRedoStack((prev) => prev.slice(1));
    toast({ title: "Redo Action", description: "Restored your previous edit." });
  };

  // Photo Uploader with Canvas Cropping
  const [imageDimensions, setImageDimensions] = React.useState({ width: 192, height: 192 });
  const [cropImageSrc, setCropImageSrc] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PNG, JPG, or JPEG image file.",
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const aspect = img.width / img.height;
        let baseW = 192;
        let baseH = 192;
        if (aspect > 1) {
          baseW = 192 * aspect;
        } else {
          baseH = 192 / aspect;
        }
        setImageDimensions({ width: baseW, height: baseH });
        setCropImageSrc(reader.result as string);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      };
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    updateData({
      ...data,
      personalInfo: { ...data.personalInfo, avatar: "" },
    });
    toast({
      title: "Photo Removed",
      description: "Avatar removed from resume.",
      variant: "success",
    });
  };

  const startDrag = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const drag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  const startDragTouch = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    setIsDragging(true);
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const dragTouch = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    if (!touch) return;
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const cropAndSave = () => {
    if (!cropImageSrc) return;
    const img = new Image();
    img.src = cropImageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 192;
      canvas.height = 192;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 192, 192);

      const destWidth = imageDimensions.width * zoom;
      const destHeight = imageDimensions.height * zoom;
      const destX = 96 + offset.x - destWidth / 2;
      const destY = 96 + offset.y - destHeight / 2;

      ctx.drawImage(img, destX, destY, destWidth, destHeight);

      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
      updateData({
        ...data,
        personalInfo: { ...data.personalInfo, avatar: croppedBase64 },
      });
      setCropImageSrc(null);
      toast({
        title: "Photo Cropped",
        description: "Profile picture updated.",
        variant: "success",
      });
    };
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



  // Project array manipulation
  const addProject = () => {
    const newProj = {
      id: Math.random().toString(36).substring(2, 9),
      name: "",
      description: "",
      role: "",
      url: "",
      startDate: "",
      endDate: "",
      projectType: "Personal",
      duration: "",
      technologies: "",
      responsibilities: "",
      keyFeatures: [] as string[],
      achievements: [] as string[],
      githubUrl: "",
      liveUrl: "",
      documentationUrl: "",
      teamSize: "",
      clientName: "",
      status: "Completed",
    };
    updateData({ ...data, projects: [...(data.projects || []), newProj] });
  };

  const removeProject = (projId: string) => {
    updateData({ ...data, projects: (data.projects || []).filter((p) => p.id !== projId) });
  };

  const shiftProject = (index: number, direction: "up" | "down") => {
    const list = [...(data.projects || [])];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    updateData({ ...data, projects: list });
  };

  const toggleProjectCollapse = (projId: string) => {
    setCollapsedProjects((prev) => ({
      ...prev,
      [projId]: !prev[projId],
    }));
  };

  const duplicateProject = (index: number) => {
    const list = [...(data.projects || [])];
    const original = list[index];
    if (!original) return;
    const duplicated = {
      ...original,
      id: Math.random().toString(36).substring(2, 9),
      name: original.name ? `${original.name} (Copy)` : "Project Copy",
    };
    const newList = [...list];
    newList.splice(index + 1, 0, duplicated);
    updateData({ ...data, projects: newList });
  };

  // Internships / Work Experience helpers
  const addInternship = () => {
    const newIntern = {
      id: Math.random().toString(36).substring(2, 9),
      company: "",
      role: "[Internship] ",
      startDate: "",
      endDate: "",
      description: "",
    };
    updateData({ ...data, experiences: [...data.experiences, newIntern] });
  };

  const addWorkExperience = () => {
    const newWork = {
      id: Math.random().toString(36).substring(2, 9),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    updateData({ ...data, experiences: [...data.experiences, newWork] });
  };

  // Awards/Activities helpers (Workshops, Responsibility, Extracurricular, Publications, Research)
  const addAwardRecord = (categoryPrefix: "[Workshop] " | "[Responsibility] " | "[Extracurricular] " | "[Publication] " | "[Research] " | "[Achievement] ") => {
    const newAward = {
      id: Math.random().toString(36).substring(2, 9),
      title: categoryPrefix,
      issuer: "",
      date: "",
      description: "",
    };
    updateData({ ...data, awards: [...(data.awards || []), newAward] });
  };

  const removeAwardRecord = (awardId: string) => {
    updateData({ ...data, awards: (data.awards || []).filter(a => a.id !== awardId) });
  };

  // Certifications helpers
  const addCertification = () => {
    const newCert = {
      id: Math.random().toString(36).substring(2, 9),
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      url: "",
    };
    updateData({ ...data, certifications: [...(data.certifications || []), newCert] });
  };

  const removeCertification = (certId: string) => {
    updateData({ ...data, certifications: (data.certifications || []).filter(c => c.id !== certId) });
  };

  // Languages helpers
  const addLanguage = () => {
    const newLang = {
      id: Math.random().toString(36).substring(2, 9),
      name: "",
      proficiency: "Reading: Intermediate, Writing: Intermediate, Speaking: Intermediate",
    };
    updateData({ ...data, languages: [...(data.languages || []), newLang] });
  };

  const removeLanguage = (langId: string) => {
    updateData({ ...data, languages: (data.languages || []).filter(l => l.id !== langId) });
  };

  // References helpers
  const addReference = () => {
    const newRef = {
      id: Math.random().toString(36).substring(2, 9),
      name: "",
      title: "",
      company: "",
      email: "",
      phone: "",
    };
    updateData({ ...data, references: [...(data.references || []), newRef] });
  };

  const removeReference = (refId: string) => {
    updateData({ ...data, references: (data.references || []).filter(r => r.id !== refId) });
  };

  // Manual save trigger
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
          linkedinUrl: data.personalInfo.linkedinUrl || "",
          githubUrl: data.personalInfo.githubUrl || "",
          portfolioUrl: data.personalInfo.portfolioUrl || "",
          leetcodeUrl: data.personalInfo.leetcodeUrl || "",
          hackerrankUrl: data.personalInfo.hackerrankUrl || "",
          kaggleUrl: data.personalInfo.kaggleUrl || "",
          mediumUrl: data.personalInfo.mediumUrl || "",
          stackoverflowUrl: data.personalInfo.stackoverflowUrl || "",
          behanceUrl: data.personalInfo.behanceUrl || "",
          dribbbleUrl: data.personalInfo.dribbbleUrl || "",
          twitterUrl: data.personalInfo.twitterUrl || "",
          youtubeUrl: data.personalInfo.youtubeUrl || "",
          devtoUrl: data.personalInfo.devtoUrl || "",
          researchgateUrl: data.personalInfo.researchgateUrl || "",
          orcidUrl: data.personalInfo.orcidUrl || "",
          googleScholarUrl: data.personalInfo.googleScholarUrl || "",
          otherLinkLabel: data.personalInfo.otherLinkLabel || "",
          otherLinkUrl: data.personalInfo.otherLinkUrl || "",
          avatar: data.personalInfo.avatar || "",
          selectedTemplate: `${selectedTemplate}?fontFamily=${customization.fontFamily || "sans"}&fontSize=${customization.fontSize || "md"}&lineSpacing=${customization.lineSpacing || "normal"}&margins=${customization.margins || "normal"}&themeColor=${encodeURIComponent(customization.themeColor || "#2563eb")}`,
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
            fieldOfStudy: edu.fieldOfStudy || "",
            grade: edu.grade || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            order: idx,
          })),
          skills: data.skills.map((skillName, idx) => ({
            name: skillName,
            order: idx,
          })),
          projects: (data.projects || []).map((proj, idx) => ({
            name: proj.name || "",
            description: proj.description || "",
            role: proj.role || "",
            url: proj.url || "",
            startDate: proj.startDate || "",
            endDate: proj.endDate || "",
            projectType: proj.projectType || "Personal",
            duration: proj.duration || "",
            technologies: proj.technologies || "",
            responsibilities: proj.responsibilities || "",
            keyFeatures: proj.keyFeatures || [],
            achievements: proj.achievements || [],
            githubUrl: proj.githubUrl || "",
            liveUrl: proj.liveUrl || "",
            documentationUrl: proj.documentationUrl || "",
            teamSize: proj.teamSize || "",
            clientName: proj.clientName || "",
            status: proj.status || "Completed",
            order: idx,
          })),
          certifications: (data.certifications || []).map((c, idx) => ({
            name: c.name || "",
            issuer: c.issuer || "",
            issueDate: c.issueDate || "",
            expiryDate: c.expiryDate || "",
            url: c.url || "",
            order: idx,
          })),
          languages: (data.languages || []).map((l, idx) => ({
            name: l.name || "",
            proficiency: l.proficiency || "",
            order: idx,
          })),
          awards: (data.awards || []).map((a, idx) => ({
            title: a.title || "",
            issuer: a.issuer || "",
            date: a.date || "",
            description: a.description || "",
            order: idx,
          })),
          interests: (data.interests || []).map((i, idx) => ({
            name: i.name || "",
            order: idx,
          })),
          references: (data.references || []).map((r, idx) => ({
            name: r.name || "",
            title: r.title || "",
            company: r.company || "",
            email: r.email || "",
            phone: r.phone || "",
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

  const generateDocxHtml = (resumeData: ResumeData, templateId: string, customizationOpts: ResumeCustomization) => {
    const { personalInfo, experiences, educations, skills } = resumeData;
    const { fontFamily, fontSize, lineSpacing, themeColor } = customizationOpts || {};

    const fontValue = fontFamily === "serif" ? "Georgia, serif" : fontFamily === "mono" ? "Courier New, monospace" : "Arial, sans-serif";
    const sizeValue = fontSize === "sm" ? "10pt" : fontSize === "lg" ? "12pt" : "11pt";
    const leadingValue = lineSpacing === "tight" ? "1.15" : lineSpacing === "loose" ? "1.8" : "1.4";
    const accent = themeColor || "#2563eb";

    const experiencesHtml = experiences
      .map(
        (exp) => `
        <div style="margin-bottom: 12px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%;">
            <tr>
              <td style="font-weight: bold; font-size: 11pt; color: #111827;">${exp.role || ""} &mdash; ${exp.company || ""}</td>
              <td align="right" style="font-size: 9.5pt; color: #6b7280; text-align: right;">${exp.startDate || ""} - ${exp.endDate || ""}</td>
            </tr>
          </table>
          <div style="margin-top: 4px; font-size: 10pt; color: #374151;">${exp.description || ""}</div>
        </div>
      `
      )
      .join("");

    const projectsHtml = (resumeData.projects || [])
      .map(
        (proj) => {
          const keyFeaturesHtml = proj.keyFeatures && proj.keyFeatures.length > 0
            ? `<div style="margin-top: 4px; margin-left: 15px; font-size: 9.5pt; color: #4b5563;">
                <strong>Key Features:</strong>
                <ul style="margin: 2px 0 0 0; padding-left: 15px;">
                  ${proj.keyFeatures.map(kf => kf ? `<li>${kf}</li>` : "").join("")}
                </ul>
               </div>`
            : "";

          const achievementsHtml = proj.achievements && proj.achievements.length > 0
            ? `<div style="margin-top: 4px; margin-left: 15px; font-size: 9.5pt; color: #4b5563;">
                <strong>Achievements:</strong>
                <ul style="margin: 2px 0 0 0; padding-left: 15px;">
                  ${proj.achievements.map(ach => ach ? `<li>${ach}</li>` : "").join("")}
                </ul>
               </div>`
            : "";

          const linksList = [];
          if (proj.githubUrl) linksList.push(`Code: <a href="${proj.githubUrl}" style="color: ${accent}; text-decoration: none;">${proj.githubUrl}</a>`);
          if (proj.liveUrl) linksList.push(`Live: <a href="${proj.liveUrl}" style="color: ${accent}; text-decoration: none;">${proj.liveUrl}</a>`);
          if (proj.documentationUrl) linksList.push(`Docs: <a href="${proj.documentationUrl}" style="color: ${accent}; text-decoration: none;">${proj.documentationUrl}</a>`);
          const linksHtml = linksList.length > 0
            ? `<div style="margin-top: 4px; font-size: 9.5pt; color: ${accent};">${linksList.join(" &nbsp;|&nbsp; ")}</div>`
            : "";

          return `
            <div style="margin-bottom: 12px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%;">
                <tr>
                  <td style="font-weight: bold; font-size: 11pt; color: #111827;">
                    ${proj.name || ""} 
                    ${proj.role ? `(${proj.role})` : ""} 
                    <span style="font-size: 9pt; font-weight: normal; background-color: #f3f4f6; padding: 1px 6px; border-radius: 4px; color: #4b5563;">${proj.projectType || ""}</span>
                    <span style="font-size: 9pt; font-weight: normal; background-color: ${proj.status === "Ongoing" ? "#fef3c7" : "#d1fae5"}; padding: 1px 6px; border-radius: 4px; color: ${proj.status === "Ongoing" ? "#92400e" : "#065f46"};">${proj.status || ""}</span>
                  </td>
                  <td align="right" style="font-size: 9.5pt; color: #6b7280; text-align: right;">${proj.duration || ""}</td>
                </tr>
              </table>
              ${(proj.clientName || proj.teamSize) ? `
                <div style="font-size: 9.5pt; color: #6b7280; margin-top: 2px;">
                  ${proj.clientName ? `Client: ${proj.clientName}` : ""}
                  ${proj.clientName && proj.teamSize ? ` &nbsp;|&nbsp; ` : ""}
                  ${proj.teamSize ? `Team Size: ${proj.teamSize}` : ""}
                </div>
              ` : ""}
              ${proj.technologies ? `<div style="font-size: 9.5pt; color: #4b5563; margin-top: 2px;"><strong>Technologies:</strong> ${proj.technologies}</div>` : ""}
              ${proj.description ? `<div style="margin-top: 4px; font-size: 10pt; color: #374151;">${proj.description}</div>` : ""}
              ${proj.responsibilities ? `<div style="margin-top: 2px; font-size: 9.5pt; color: #4b5563;"><strong>Responsibilities:</strong> ${proj.responsibilities}</div>` : ""}
              ${keyFeaturesHtml}
              ${achievementsHtml}
              ${linksHtml}
            </div>
          `;
        }
      )
      .join("");

    const educationsHtml = educations
      .map(
        (edu) => `
        <div style="margin-bottom: 8px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%;">
            <tr>
              <td style="font-weight: bold; font-size: 11pt; color: #111827;">${edu.school || ""}</td>
              <td align="right" style="font-size: 9.5pt; color: #6b7280; text-align: right;">${edu.startDate || ""} - ${edu.endDate || ""}</td>
            </tr>
          </table>
          <div style="font-size: 10pt; color: #4b5563;">${edu.degree || ""}</div>
        </div>
      `
      )
      .join("");

    const skillsHtml = skills.length > 0 
      ? `<p style="font-size: 10pt; color: #374151;">${skills.join(" &bull; ")}</p>`
      : "";

    const profiles = [
      { url: personalInfo.linkedinUrl, label: "LinkedIn" },
      { url: personalInfo.githubUrl, label: "GitHub" },
      { url: personalInfo.portfolioUrl, label: "Portfolio" },
      { url: personalInfo.leetcodeUrl, label: "LeetCode" },
      { url: personalInfo.hackerrankUrl, label: "HackerRank" },
      { url: personalInfo.kaggleUrl, label: "Kaggle" },
      { url: personalInfo.mediumUrl, label: "Medium" },
      { url: personalInfo.stackoverflowUrl, label: "StackOverflow" },
      { url: personalInfo.behanceUrl, label: "Behance" },
      { url: personalInfo.dribbbleUrl, label: "Dribbble" },
      { url: personalInfo.twitterUrl, label: "Twitter" },
      { url: personalInfo.youtubeUrl, label: "YouTube" },
      { url: personalInfo.devtoUrl, label: "Dev.to" },
      { url: personalInfo.researchgateUrl, label: "ResearchGate" },
      { url: personalInfo.orcidUrl, label: "ORCID" },
      { url: personalInfo.googleScholarUrl, label: "Scholar" },
      { url: personalInfo.otherLinkUrl, label: personalInfo.otherLinkLabel || "Link" },
    ].filter((p) => p.url);

    const profilesHtml = profiles.length > 0
      ? `<p style="font-size: 9.5pt; color: #6b7280; text-align: center; margin-top: 4px;">
          ${profiles.map(p => `<a href="${p.url}" style="color: ${accent}; text-decoration: none;">${p.label}</a>`).join(" &nbsp;|&nbsp; ")}
         </p>`
      : "";

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <title>${personalInfo.fullName || "Resume"}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: ${fontValue};
            font-size: ${sizeValue};
            line-height: ${leadingValue};
            color: #374151;
            margin: 1.0in;
          }
          h1 {
            font-size: 20pt;
            font-weight: bold;
            color: ${accent};
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          h2 {
            font-size: 12pt;
            font-weight: bold;
            color: ${accent};
            border-bottom: 1.5pt solid ${accent};
            padding-bottom: 2px;
            margin: 16px 0 8px 0;
            text-transform: uppercase;
          }
          p {
            margin: 0 0 8px 0;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px;">
          <h1>${personalInfo.fullName || "Your Name"}</h1>
          <p style="font-size: 11pt; font-weight: bold; color: #4b5563; margin-bottom: 6px;">${personalInfo.title || ""}</p>
          <p style="font-size: 9.5pt; color: #6b7280;">
            ${personalInfo.email ? `Email: ${personalInfo.email}` : ""}
            ${personalInfo.phone ? ` &nbsp;|&nbsp; Phone: ${personalInfo.phone}` : ""}
            ${personalInfo.location ? ` &nbsp;|&nbsp; Location: ${personalInfo.location}` : ""}
            ${personalInfo.website ? ` &nbsp;|&nbsp; Website: ${personalInfo.website}` : ""}
          </p>
          ${profilesHtml}
        </div>

        <!-- Summary -->
        ${
          personalInfo.summary
            ? `
          <h2>Executive Summary</h2>
          <div style="font-size: 10.5pt; color: #374151;">${personalInfo.summary}</div>
        `
            : ""
        }

        <!-- Experience -->
        ${
          experiences.length > 0
            ? `
          <h2>Professional Experience</h2>
          ${experiencesHtml}
        `
            : ""
        }

        <!-- Projects -->
        ${
          (resumeData.projects || []).length > 0
            ? `
          <h2>Projects</h2>
          ${projectsHtml}
        `
            : ""
        }

        <!-- Education -->
        ${
          educations.length > 0
            ? `
          <h2>Education</h2>
          ${educationsHtml}
        `
            : ""
        }

        <!-- Skills -->
        ${
          skills.length > 0
            ? `
          <h2>Key Competencies</h2>
          ${skillsHtml}
        `
            : ""
        }
      </body>
      </html>
    `;
  };

  const handleExportDocx = () => {
    const htmlString = generateDocxHtml(data, selectedTemplate, customization);
    const blob = new Blob([htmlString], { type: "application/vnd.ms-word" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `${data.personalInfo.fullName || "resume"}.doc`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    toast({
      title: "DOCX Exported",
      description: "Editable Word document downloaded successfully.",
      variant: "success",
    });
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

  const handleSaveVersion = async () => {
    if (!newVersionTitle.trim()) {
      toast({
        title: "Version Title Required",
        description: "Please enter a descriptive label for this snapshot.",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch(`/api/resumes/${id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newVersionTitle }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "Version Saved",
          description: `Snapshot "${newVersionTitle}" successfully created.`,
          variant: "success",
        });
        setNewVersionTitle("");
        fetchDbVersions();
      } else {
        throw new Error(json.error || "Failed to log version.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to log snapshot.";
      toast({
        title: "Log Version Failed",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const handleRestoreVersion = async (version: DBVersionItem) => {
    try {
      const versionData = version.data;
      if (!versionData) return;

      const restoredData: ResumeData = {
        personalInfo: {
          fullName: versionData.fullName || "",
          title: "", // Set default title if missing
          email: versionData.email || "",
          phone: versionData.phone || "",
          location: versionData.location || "",
          website: versionData.website || "",
          avatar: versionData.avatar || "",
          summary: versionData.summary || "",
        },
        experiences: (versionData.experiences || []).map((exp: DBExperience) => ({
          id: exp.id || Math.random().toString(36).substring(2, 9),
          company: exp.company || "",
          role: exp.role || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          description: exp.description || "",
        })),
        educations: (versionData.educations || []).map((edu: DBEducation) => ({
          id: edu.id || Math.random().toString(36).substring(2, 9),
          school: edu.school || "",
          degree: edu.degree || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
        })),
        skills: (versionData.skills || []).map((s: DBSkill | string) => typeof s === "string" ? s : s.name),
      };

      updateData(restoredData);
      
      if (versionData.selectedTemplate) {
        const parts = versionData.selectedTemplate.split("?");
        setSelectedTemplate(parts[0]);
        if (parts[1]) {
          const params = new URLSearchParams(parts[1]);
          setCustomization({
            fontFamily: (params.get("fontFamily") as ResumeCustomization["fontFamily"]) || "sans",
            fontSize: (params.get("fontSize") as ResumeCustomization["fontSize"]) || "md",
            lineSpacing: (params.get("lineSpacing") as ResumeCustomization["lineSpacing"]) || "normal",
            margins: (params.get("margins") as ResumeCustomization["margins"]) || "normal",
            themeColor: params.get("themeColor") || "#2563eb",
          });
        }
      }

      toast({
        title: "Version Restored",
        description: `Snapshot "${version.title}" successfully loaded.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Restore failed:", err);
      toast({
        title: "Restore Failed",
        description: "Failed to parse version snapshot payload.",
        variant: "destructive",
      });
    }
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
          body > :not(.printable-resume-container) {
            display: none !important;
          }
          div[role="dialog"], header, nav, aside, footer, button {
            display: none !important;
          }
          .printable-resume-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
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
          <Button variant="outline" size="sm" onClick={handleUndo} title="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo} title="Redo">
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJson} title="Export JSON">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportDocx} title="Export Word DOCX">
            <FileText className="h-4 w-4" />
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
          <div className="flex gap-2 overflow-x-auto border-b border-border/40 pb-2 scrollbar-none">
            {[
              { id: "personal", label: "👤 Personal", icon: User },
              { id: "profiles", label: "🌍 Profiles", icon: Globe },
              { id: "education", label: "🎓 Education", icon: GraduationCap },
              { id: "skills", label: "💻 Skills", icon: Sparkles },
              { id: "projects", label: "🚀 Projects", icon: FileText },
              { id: "internships", label: "🏢 Internship", icon: Briefcase },
              { id: "certifications", label: "📜 Certifications", icon: Award },
              { id: "achievements", label: "🏆 Achievements", icon: CheckCircle },
              { id: "extracurricular", label: "🎯 Activities", icon: Activity },
              { id: "experience", label: "💼 Work Exp", icon: BookOpen },
              { id: "customization", label: "🎨 Design", icon: Palette },
              { id: "history", label: "⏳ History", icon: History },
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <IconComp className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* AI Suggestions Panel */}
          {computedSuggestions.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                  AI Improvement Suggestions ({computedSuggestions.length})
                </div>
                <ul className="mt-1.5 list-disc list-inside space-y-1 text-[10px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed pl-1">
                  {computedSuggestions.slice(0, 3).map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                  {computedSuggestions.length > 3 && (
                    <li className="list-none font-semibold text-[9px] text-muted-foreground mt-0.5">
                      + {computedSuggestions.length - 3} more suggestions...
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Form Content */}
          <div className="min-h-[300px] flex-1">
            {/* Tab 1: Personal Details */}
            {activeTab === "personal" && (
              <>
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => document.getElementById("avatar-upload")?.click()}
                        >
                          Upload Profile Photo
                        </Button>
                        {data.personalInfo.avatar && (
                          <Button
                            variant="destructive"
                            size="sm"
                            type="button"
                            onClick={handleRemovePhoto}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Accepts PNG, JPG formats
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Subhashini Sundararajan"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.fullName}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, fullName: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Professional Title <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science Undergraduate / Frontend Intern"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.title}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, title: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Email <span className="text-destructive">*</span></label>
                      <input
                        type="email"
                        placeholder="e.g. subhashini@college.edu"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.email}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, email: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Phone <span className="text-destructive">*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. +1 555-0199"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.phone}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, phone: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* City, State, Country Grid */}
                    <div className="col-span-2 grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">City</label>
                        <input
                          type="text"
                          placeholder="e.g. Los Angeles"
                          className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                          value={(data.personalInfo.location || "").split(",")[0]?.trim() || ""}
                          onChange={(e) => {
                            const parts = (data.personalInfo.location || "").split(",").map(p => p.trim());
                            const city = e.target.value.trim();
                            const state = parts[1] || "";
                            const country = parts[2] || "";
                            const val = [city, state, country].filter(Boolean).join(", ");
                            updateData({
                              ...data,
                              personalInfo: { ...data.personalInfo, location: val }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">State</label>
                        <input
                          type="text"
                          placeholder="e.g. California"
                          className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                          value={(data.personalInfo.location || "").split(",")[1]?.trim() || ""}
                          onChange={(e) => {
                            const parts = (data.personalInfo.location || "").split(",").map(p => p.trim());
                            const city = parts[0] || "";
                            const state = e.target.value.trim();
                            const country = parts[2] || "";
                            const val = [city, state, country].filter(Boolean).join(", ");
                            updateData({
                              ...data,
                              personalInfo: { ...data.personalInfo, location: val }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Country</label>
                        <input
                          type="text"
                          placeholder="e.g. USA"
                          className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                          value={(data.personalInfo.location || "").split(",")[2]?.trim() || ""}
                          onChange={(e) => {
                            const parts = (data.personalInfo.location || "").split(",").map(p => p.trim());
                            const city = parts[0] || "";
                            const state = parts[1] || "";
                            const country = e.target.value.trim();
                            const val = [city, state, country].filter(Boolean).join(", ");
                            updateData({
                              ...data,
                              personalInfo: { ...data.personalInfo, location: val }
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Website / Portfolio Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://myportfolio.com"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.website}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, website: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Summary Textarea with Toolbar */}
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
                      placeholder="e.g. Enthusiastic and detail-oriented final-year Computer Science undergraduate with a passion for web development and cloud technologies. Proven track record of building responsive Next.js web applications, scoring high in algorithmic problem-solving contests, and collaborating in team-based hackathons. Seeking a software engineering internship or entry-level role to leverage expertise in React and TypeScript."
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={data.personalInfo.summary}
                      onChange={(e) =>
                        updateData({
                          ...data,
                          personalInfo: { ...data.personalInfo, summary: e.target.value },
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              </>
            )}

            {/* Tab: Professional Profiles */}
            {activeTab === "profiles" && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Globe className="h-4 w-4 text-primary" />
                    Professional & Coding Profiles
                  </CardTitle>
                  <CardDescription>
                    Add links to your professional profiles, portfolio, and coding contest platforms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    {/* LinkedIn */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">LinkedIn URL</label>
                      <input
                        type="text"
                        placeholder="https://linkedin.com/in/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.linkedinUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, linkedinUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* GitHub */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">GitHub URL</label>
                      <input
                        type="text"
                        placeholder="https://github.com/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.githubUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, githubUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* Portfolio */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Portfolio Website</label>
                      <input
                        type="text"
                        placeholder="https://myportfolio.com"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.portfolioUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, portfolioUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* LeetCode */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">LeetCode Profile</label>
                      <input
                        type="text"
                        placeholder="https://leetcode.com/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.leetcodeUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, leetcodeUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* HackerRank */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">HackerRank Profile</label>
                      <input
                        type="text"
                        placeholder="https://hackerrank.com/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.hackerrankUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, hackerrankUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* Kaggle */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Kaggle Profile</label>
                      <input
                        type="text"
                        placeholder="https://kaggle.com/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.kaggleUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, kaggleUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* Medium */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Medium Profile</label>
                      <input
                        type="text"
                        placeholder="https://medium.com/@username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.mediumUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, mediumUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* Stack Overflow */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Stack Overflow Profile</label>
                      <input
                        type="text"
                        placeholder="https://stackoverflow.com/users/uid/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.stackoverflowUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, stackoverflowUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* Behance */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Behance Profile</label>
                      <input
                        type="text"
                        placeholder="https://behance.net/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.behanceUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, behanceUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* Dribbble */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Dribbble Profile</label>
                      <input
                        type="text"
                        placeholder="https://dribbble.com/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.dribbbleUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, dribbbleUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* Twitter / X */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">X (Twitter) URL</label>
                      <input
                        type="text"
                        placeholder="https://x.com/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.twitterUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, twitterUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* YouTube */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">YouTube Channel URL</label>
                      <input
                        type="text"
                        placeholder="https://youtube.com/@channel"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.youtubeUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, youtubeUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* Dev.to */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Dev.to URL</label>
                      <input
                        type="text"
                        placeholder="https://dev.to/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.devtoUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, devtoUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* Codeforces */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Codeforces Profile URL</label>
                      <input
                        type="text"
                        placeholder="https://codeforces.com/profile/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.researchgateUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, researchgateUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* CodeChef */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">CodeChef Profile URL</label>
                      <input
                        type="text"
                        placeholder="https://codechef.com/users/username"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.orcidUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, orcidUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* Google Scholar */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Google Scholar URL</label>
                      <input
                        type="text"
                        placeholder="https://scholar.google.com/citations?user=uid"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={data.personalInfo.googleScholarUrl || ""}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personalInfo: { ...data.personalInfo, googleScholarUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    {/* Custom/Other Professional Link (custom label + URL) */}
                    <div className="col-span-2 grid grid-cols-3 gap-4">
                      <div className="space-y-1 col-span-1">
                        <label className="text-xs font-semibold text-muted-foreground">Other Link Label</label>
                        <input
                          type="text"
                          placeholder="e.g. Medium"
                          className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                          value={data.personalInfo.otherLinkLabel || ""}
                          onChange={(e) =>
                            updateData({
                              ...data,
                              personalInfo: { ...data.personalInfo, otherLinkLabel: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground">Other Link URL</label>
                        <input
                          type="text"
                          placeholder="https://example.com"
                          className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                          value={data.personalInfo.otherLinkUrl || ""}
                          onChange={(e) =>
                            updateData({
                              ...data,
                              personalInfo: { ...data.personalInfo, otherLinkUrl: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab 2: Work Experience */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                <Button onClick={addWorkExperience} className="w-full flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Work Experience
                </Button>

                {data.experiences.filter((exp) => !exp.role?.startsWith("[Internship] ")).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border/40 rounded-lg">
                    No full-time work experience added yet. If you have internships, add them in the Internships tab!
                  </div>
                ) : (
                  data.experiences.map((exp, idx) => {
                    if (exp.role?.startsWith("[Internship] ")) return null;

                    return (
                      <Card key={exp.id} className="glassmorphism">
                        <CardHeader className="py-3 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-bold">Position #{idx + 1}: {exp.company || "Company"}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              updateData({
                                ...data,
                                experiences: data.experiences.filter((item) => item.id !== exp.id)
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Acme Corp"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={exp.company}
                                onChange={(e) => {
                                  const list = data.experiences.map((item) =>
                                    item.id === exp.id ? { ...item, company: e.target.value } : item
                                  );
                                  updateData({ ...data, experiences: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">Role / Job Title</label>
                              <input
                                type="text"
                                placeholder="e.g. Associate Software Engineer"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={exp.role}
                                onChange={(e) => {
                                  const list = data.experiences.map((item) =>
                                    item.id === exp.id ? { ...item, role: e.target.value } : item
                                  );
                                  updateData({ ...data, experiences: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">Start Date/Year</label>
                              <input
                                type="text"
                                placeholder="e.g. Jun 2024"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={exp.startDate}
                                onChange={(e) => {
                                  const list = data.experiences.map((item) =>
                                    item.id === exp.id ? { ...item, startDate: e.target.value } : item
                                  );
                                  updateData({ ...data, experiences: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">End Date/Year (or Present)</label>
                              <input
                                type="text"
                                placeholder="e.g. Present"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={exp.endDate}
                                onChange={(e) => {
                                  const list = data.experiences.map((item) =>
                                    item.id === exp.id ? { ...item, endDate: e.target.value } : item
                                  );
                                  updateData({ ...data, experiences: list });
                                }}
                              />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">Job Description / Responsibilities</label>
                              <textarea
                                rows={3}
                                placeholder="e.g. Developed high-performance frontend components using Next.js..."
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={exp.description}
                                onChange={(e) => {
                                  const list = data.experiences.map((item) =>
                                    item.id === exp.id ? { ...item, description: e.target.value } : item
                                  );
                                  updateData({ ...data, experiences: list });
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab: Internships */}
            {activeTab === "internships" && (
              <div className="space-y-4">
                <Button onClick={addInternship} className="w-full flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Internship
                </Button>

                {data.experiences.filter((exp) => exp.role?.startsWith("[Internship] ")).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border/40 rounded-lg">
                    No internships added yet. Click "Add Internship" to start!
                  </div>
                ) : (
                  data.experiences.map((exp, idx) => {
                    if (!exp.role?.startsWith("[Internship] ")) return null;

                    const cleanRole = exp.role.replace(/^\[Internship\]\s*/, "");
                    const parsed = (() => {
                      const fullDesc = exp.description || "";
                      const techMatch = fullDesc.match(/\[Technologies:\s*(.*?)\]/);
                      const certMatch = fullDesc.match(/\[Certificate:\s*(.*?)\]/);
                      const cleanDesc = fullDesc
                        .replace(/\[Technologies:\s*.*?\]/g, "")
                        .replace(/\[Certificate:\s*.*?\]/g, "")
                        .trim();
                      return {
                        description: cleanDesc,
                        technologies: techMatch ? techMatch[1] : "",
                        certificateUrl: certMatch ? certMatch[1] : "",
                      };
                    })();

                    const updateInternField = (field: "company" | "role" | "startDate" | "endDate" | "description" | "technologies" | "certificateUrl", value: string) => {
                      const company = field === "company" ? value : exp.company || "";
                      const roleVal = field === "role" ? value : cleanRole;
                      const role = `[Internship] ${roleVal}`;
                      const startDate = field === "startDate" ? value : exp.startDate || "";
                      const endDate = field === "endDate" ? value : exp.endDate || "";
                      
                      const rawDesc = field === "description" ? value : parsed.description;
                      const techs = field === "technologies" ? value : parsed.technologies;
                      const certUrl = field === "certificateUrl" ? value : parsed.certificateUrl;
                      
                      let description = rawDesc;
                      if (techs || certUrl) {
                        description += `\n\n[Technologies: ${techs}]\n[Certificate: ${certUrl}]`;
                      }

                      const list = data.experiences.map((item) =>
                        item.id === exp.id ? { ...item, company, role, startDate, endDate, description } : item
                      );
                      updateData({ ...data, experiences: list });
                    };

                    return (
                      <Card key={exp.id} className="glassmorphism">
                        <CardHeader className="py-3 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-bold">Internship #{idx + 1}: {exp.company || "Company"}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              updateData({
                                ...data,
                                experiences: data.experiences.filter((item) => item.id !== exp.id)
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Google"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={exp.company}
                                onChange={(e) => updateInternField("company", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">Role / Internship Title</label>
                              <input
                                type="text"
                                placeholder="e.g. Software Engineer Intern"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={cleanRole}
                                onChange={(e) => updateInternField("role", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">Start Year/Month</label>
                              <input
                                type="text"
                                placeholder="e.g. May 2024"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={exp.startDate}
                                onChange={(e) => updateInternField("startDate", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">End Year/Month (or Present)</label>
                              <input
                                type="text"
                                placeholder="e.g. Aug 2024"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={exp.endDate}
                                onChange={(e) => updateInternField("endDate", e.target.value)}
                              />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">Technologies Used</label>
                              <input
                                type="text"
                                placeholder="e.g. React, Next.js, Node.js"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={parsed.technologies}
                                onChange={(e) => updateInternField("technologies", e.target.value)}
                              />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">Certificate URL (Optional)</label>
                              <input
                                type="text"
                                placeholder="e.g. https://certificates.com/my-internship-id"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={parsed.certificateUrl}
                                onChange={(e) => updateInternField("certificateUrl", e.target.value)}
                              />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground">Internship Description / Responsibilities</label>
                              <textarea
                                rows={3}
                                placeholder="e.g. Built interactive dashboards using React. Collaborated with a team of 4 engineers..."
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={parsed.description}
                                onChange={(e) => updateInternField("description", e.target.value)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab: Projects */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <Button onClick={addProject} className="w-full flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>

                {(data.projects || []).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border/40 rounded-lg">
                    No projects added yet. Click "Add Project" to start adding your work!
                  </div>
                ) : (
                  (data.projects || []).map((proj, idx) => {
                    const isCollapsed = !!collapsedProjects[proj.id || ""];

                    return (
                      <Card
                        key={proj.id || idx}
                        className={cn(
                          "glassmorphism transition-all duration-200",
                          draggedIndex === idx && draggedType === "project" ? "opacity-40 scale-[0.98] border-primary/40 bg-primary/5" : ""
                        )}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx, "project")}
                        onDragOver={(e) => handleDragOver(e, idx, "project")}
                        onDragEnd={handleDragEnd}
                      >
                        <CardHeader className="py-3 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <FileText className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-bold">
                              {proj.name || `Project #${idx + 1}`}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleProjectCollapse(proj.id || "")}
                              title={isCollapsed ? "Expand" : "Collapse"}
                            >
                              {isCollapsed ? "Expand" : "Collapse"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => shiftProject(idx, "up")}
                              disabled={idx === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => shiftProject(idx, "down")}
                              disabled={idx === (data.projects || []).length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Duplicate Project"
                              onClick={() => duplicateProject(idx)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => removeProject(proj.id || "")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        {!isCollapsed && (
                          <CardContent className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                              {/* Project Name */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Project Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. AI Resume Builder Pro"
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.name}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, name: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>
                              {/* Role */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Role / Contribution</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Lead Developer"
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.role || ""}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, role: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>
                              {/* Project Type */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Project Type</label>
                                <select
                                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.projectType || "Personal"}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, projectType: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                >
                                  <option value="Personal">Personal</option>
                                  <option value="Academic">Academic</option>
                                  <option value="Internship">Internship</option>
                                  <option value="Freelance">Freelance</option>
                                  <option value="Open Source">Open Source</option>
                                </select>
                              </div>
                              {/* Duration */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Duration</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 3 months, Jan 2023 - Mar 2023"
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.duration || ""}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, duration: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>
                              {/* Status */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Status</label>
                                <select
                                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.status || "Completed"}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, status: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                >
                                  <option value="Completed">Completed</option>
                                  <option value="Ongoing">Ongoing</option>
                                </select>
                              </div>
                              {/* Client Name */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Client Name (Optional)</label>
                                <input
                                  type="text"
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.clientName || ""}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, clientName: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>
                              {/* Team Size */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Team Size</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 5 members"
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.teamSize || ""}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, teamSize: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>
                              {/* Technologies Used */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Technologies Used</label>
                                <input
                                  type="text"
                                  placeholder="React, Next.js, TailwindCSS"
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.technologies || ""}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, technologies: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>
                              {/* GitHub Repo URL */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">GitHub Repo URL</label>
                                <input
                                  type="text"
                                  placeholder="https://github.com/..."
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.githubUrl || ""}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, githubUrl: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>
                              {/* Live Demo URL */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Live Demo URL</label>
                                <input
                                  type="text"
                                  placeholder="https://myproj.com"
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.liveUrl || ""}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, liveUrl: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>
                              {/* Video Demo / Documentation URL */}
                              <div className="col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Video Demo / Documentation URL</label>
                                <input
                                  type="text"
                                  placeholder="https://youtube.com/watch?v=... or https://docs.myproj.com"
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.documentationUrl || ""}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, documentationUrl: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>

                              {/* Short Description */}
                              <div className="col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Short Description (One-liner summary)</label>
                                <textarea
                                  rows={1}
                                  placeholder="e.g. A real-time collaborative code editor with chat workspace"
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.description}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, description: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>

                              {/* Detailed Description */}
                              <div className="col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Detailed Description (Learnings & Implementation details)</label>
                                <textarea
                                  rows={3}
                                  placeholder="e.g. Managed real-time state synchronization using Yjs CRDTs and WebSockets. Integrated Monaco Editor with syntax highlighting for 10+ languages. Scaled connection handlers via AWS Redis adapter, reducing latency by 40%."
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.url || ""}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, url: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>

                              {/* Screenshots URL */}
                              <div className="col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Screenshots Folder / Image URL (Optional)</label>
                                <input
                                  type="text"
                                  placeholder="https://imgur.com/... or https://drive.google.com/..."
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.clientName || ""}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, clientName: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>

                              {/* Responsibilities */}
                              <div className="col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Responsibilities</label>
                                <textarea
                                  rows={2}
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                  value={proj.responsibilities || ""}
                                  onChange={(e) => {
                                    const list = (data.projects || []).map((item, pidx) =>
                                      pidx === idx ? { ...item, responsibilities: e.target.value } : item
                                    );
                                    updateData({ ...data, projects: list });
                                  }}
                                />
                              </div>

                              {/* Key Features */}
                              <div className="col-span-2 space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground block">Key Features</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    id={`new-feature-input-${idx}`}
                                    placeholder="Enter a key feature..."
                                    className="flex-1 rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        const input = e.currentTarget;
                                        const val = input.value.trim();
                                        if (val) {
                                          const features = proj.keyFeatures || [];
                                          const list = (data.projects || []).map((item, pidx) =>
                                            pidx === idx ? { ...item, keyFeatures: [...features, val] } : item
                                          );
                                          updateData({ ...data, projects: list });
                                          input.value = "";
                                        }
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                      const input = document.getElementById(`new-feature-input-${idx}`) as HTMLInputElement;
                                      const val = input?.value.trim();
                                      if (val) {
                                        const features = proj.keyFeatures || [];
                                        const list = (data.projects || []).map((item, pidx) =>
                                          pidx === idx ? { ...item, keyFeatures: [...features, val] } : item
                                        );
                                        updateData({ ...data, projects: list });
                                        input.value = "";
                                      }
                                    }}
                                  >
                                    Add
                                  </Button>
                                </div>
                                <div className="space-y-1 mt-1">
                                  {(proj.keyFeatures || []).map((feature, fidx) => (
                                    <div key={fidx} className="flex items-center justify-between bg-muted/30 px-3 py-1.5 rounded border border-border/40 text-xs text-foreground animate-fadeIn">
                                      <span>• {feature}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        type="button"
                                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                          const list = (data.projects || []).map((item, pidx) =>
                                            pidx === idx ? { ...item, keyFeatures: (item.keyFeatures || []).filter((_, i) => i !== fidx) } : item
                                          );
                                          updateData({ ...data, projects: list });
                                        }}
                                      >
                                        &times;
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Achievements */}
                              <div className="col-span-2 space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground block">Achievements</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    id={`new-achievement-input-${idx}`}
                                    placeholder="Enter an achievement..."
                                    className="flex-1 rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        const input = e.currentTarget;
                                        const val = input.value.trim();
                                        if (val) {
                                          const achs = proj.achievements || [];
                                          const list = (data.projects || []).map((item, pidx) =>
                                            pidx === idx ? { ...item, achievements: [...achs, val] } : item
                                          );
                                          updateData({ ...data, projects: list });
                                          input.value = "";
                                        }
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                      const input = document.getElementById(`new-achievement-input-${idx}`) as HTMLInputElement;
                                      const val = input?.value.trim();
                                      if (val) {
                                        const achs = proj.achievements || [];
                                        const list = (data.projects || []).map((item, pidx) =>
                                          pidx === idx ? { ...item, achievements: [...achs, val] } : item
                                        );
                                        updateData({ ...data, projects: list });
                                        input.value = "";
                                      }
                                    }}
                                  >
                                    Add
                                  </Button>
                                </div>
                                <div className="space-y-1 mt-1">
                                  {(proj.achievements || []).map((ach, aidx) => (
                                    <div key={aidx} className="flex items-center justify-between bg-muted/30 px-3 py-1.5 rounded border border-border/40 text-xs text-foreground animate-fadeIn">
                                      <span>• {ach}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        type="button"
                                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                          const list = (data.projects || []).map((item, pidx) =>
                                            pidx === idx ? { ...item, achievements: (item.achievements || []).filter((_, i) => i !== aidx) } : item
                                          );
                                          updateData({ ...data, projects: list });
                                        }}
                                      >
                                        &times;
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 3: Education History */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <Button onClick={addEducation} className="w-full flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Education Record
                </Button>

                {data.educations.map((edu, idx) => (
                  <Card
                    key={edu.id}
                    className={cn(
                      "glassmorphism transition-all duration-200",
                      draggedIndex === idx && draggedType === "education" ? "opacity-40 scale-[0.98] border-primary/40 bg-primary/5" : ""
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx, "education")}
                    onDragOver={(e) => handleDragOver(e, idx, "education")}
                    onDragEnd={handleDragEnd}
                  >
                    <CardHeader className="py-3 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-bold">Record #{idx + 1}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shiftEducation(idx, "up")}
                          disabled={idx === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shiftEducation(idx, "down")}
                          disabled={idx === data.educations.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeEducation(edu.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            College / School Name <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. ABC Institute of Technology"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={(edu.school || "").split(" - ")[0] || ""}
                            onChange={(e) => {
                              const parts = (edu.school || "").split(" - ");
                              const college = e.target.value;
                              const university = parts[1] || "";
                              const val = [college, university].filter(Boolean).join(" - ");
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, school: val } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                        </div>
                        {/* University Affiliation */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            University Affiliation
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Stanford University"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={(edu.school || "").split(" - ")[1] || ""}
                            onChange={(e) => {
                              const parts = (edu.school || "").split(" - ");
                              const college = parts[0] || "";
                              const university = e.target.value;
                              const val = [college, university].filter(Boolean).join(" - ");
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, school: val } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                        </div>
                        {/* Degree */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Degree / Course <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. B.Tech, B.S., High School"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, degree: e.target.value } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                        </div>
                        {/* Specialization / Major */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Specialization / Major
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Computer Science & Engineering"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={edu.fieldOfStudy || ""}
                            onChange={(e) => {
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, fieldOfStudy: e.target.value } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                        </div>
                        {/* CGPA / Percentage */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            CGPA / Percentage / Grade
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 9.2 CGPA or 85%"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={edu.grade || ""}
                            onChange={(e) => {
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, grade: e.target.value } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                        </div>
                        {/* Start Year */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Start Year
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2022"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={edu.startDate}
                            onChange={(e) => {
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, startDate: e.target.value } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                        </div>
                        {/* End Year */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            End Year (Or Expected)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2026"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={edu.endDate}
                            onChange={(e) => {
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, endDate: e.target.value } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Tab 4: Skills Checklist */}
            {activeTab === "skills" && (() => {
              const addCategorySkill = (skill: string, category: string) => {
                const trimmed = skill.trim();
                if (!trimmed) return;
                const formatted = `[${category}] ${trimmed}`;
                if (data.skills.includes(formatted)) return;
                updateData({ ...data, skills: [...data.skills, formatted] });
              };

              const removeCategorySkill = (skillName: string, category: string) => {
                const target = data.skills.find(
                  (s) =>
                    s === `[${category}] ${skillName}` ||
                    (category === "Technical" && s === skillName)
                );
                if (target) {
                  updateData({ ...data, skills: data.skills.filter((s) => s !== target) });
                } else {
                  updateData({ ...data, skills: data.skills.filter((s) => s !== skillName && s !== `[${category}] ${skillName}`) });
                }
              };

              const getSkillsByCategory = (category: string) => {
                return data.skills
                  .filter((s) => {
                    if (s.startsWith(`[${category}] `)) return true;
                    if (category === "Technical" && !s.startsWith("[")) return true;
                    return false;
                  })
                  .map((s) => s.replace(/^\[.*?\]\s*/, ""));
              };

              const categories = [
                { id: "tech", name: "Technical Skills", placeholder: "e.g. C++, Java, Python, Go" },
                { id: "frameworks", name: "Frameworks", placeholder: "e.g. React, Next.js, Express, Django" },
                { id: "databases", name: "Databases", placeholder: "e.g. PostgreSQL, MongoDB, Redis" },
                { id: "cloud", name: "Cloud", placeholder: "e.g. AWS, Google Cloud, Azure" },
                { id: "tools", name: "Tools", placeholder: "e.g. Git, Docker, Kubernetes, VS Code" },
                { id: "soft", name: "Soft Skills", placeholder: "e.g. Communication, Leadership, Teamwork" },
                { id: "languages", name: "Languages", placeholder: "e.g. English, Spanish, Hindi, French" },
              ];

              return (
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-muted-foreground">Categorized Skills (LinkedIn & Canva Style)</div>
                  {categories.map((cat) => (
                    <Card key={cat.id} className="glassmorphism">
                      <CardHeader className="py-2.5">
                        <CardTitle className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-primary" />
                          {cat.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            id={`skill-input-${cat.id}`}
                            placeholder={cat.placeholder}
                            className="flex-1 rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.currentTarget;
                                addCategorySkill(input.value, cat.name);
                                input.value = "";
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(`skill-input-${cat.id}`) as HTMLInputElement;
                              if (input && input.value.trim()) {
                                addCategorySkill(input.value, cat.name);
                                input.value = "";
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {getSkillsByCategory(cat.name).length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">No tags added yet</span>
                          ) : (
                            getSkillsByCategory(cat.name).map((sk) => (
                              <span
                                key={sk}
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                              >
                                {sk}
                                <button
                                  type="button"
                                  className="text-primary/70 hover:text-primary text-[12px] font-bold ml-1"
                                  onClick={() => removeCategorySkill(sk, cat.name)}
                                >
                                  &times;
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()}

            {/* Tab: Certifications & Workshops */}
            {activeTab === "certifications" && (
              <div className="space-y-6">
                {/* Certifications Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-primary" />
                      Certifications
                    </h3>
                    <Button onClick={addCertification} size="sm" className="flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Add Certification
                    </Button>
                  </div>

                  {(!data.certifications || data.certifications.length === 0) ? (
                    <div className="text-center py-6 text-muted-foreground text-xs border-2 border-dashed border-border/40 rounded-lg">
                      No certifications added yet.
                    </div>
                  ) : (
                    (data.certifications || []).map((cert, idx) => (
                      <Card key={cert.id} className="glassmorphism">
                        <CardHeader className="py-2.5 flex flex-row items-center justify-between">
                          <CardTitle className="text-xs font-bold">Certification #{idx + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => removeCertification(cert.id || "")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-muted-foreground">Certification Name</label>
                              <input
                                type="text"
                                placeholder="e.g. AWS Certified Cloud Practitioner"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                value={cert.name || ""}
                                onChange={(e) => {
                                  const list = (data.certifications || []).map((item) =>
                                    item.id === cert.id ? { ...item, name: e.target.value } : item
                                  );
                                  updateData({ ...data, certifications: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-muted-foreground">Issuing Organization</label>
                              <input
                                type="text"
                                placeholder="e.g. Amazon Web Services"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                value={cert.issuer || ""}
                                onChange={(e) => {
                                  const list = (data.certifications || []).map((item) =>
                                    item.id === cert.id ? { ...item, issuer: e.target.value } : item
                                  );
                                  updateData({ ...data, certifications: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-muted-foreground">Issue Date / Year</label>
                              <input
                                type="text"
                                placeholder="e.g. Nov 2023"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                value={cert.issueDate || ""}
                                onChange={(e) => {
                                  const list = (data.certifications || []).map((item) =>
                                    item.id === cert.id ? { ...item, issueDate: e.target.value } : item
                                  );
                                  updateData({ ...data, certifications: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-muted-foreground">Credential ID (Optional)</label>
                              <input
                                type="text"
                                placeholder="e.g. AWS-123456"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                value={cert.expiryDate || ""}
                                onChange={(e) => {
                                  const list = (data.certifications || []).map((item) =>
                                    item.id === cert.id ? { ...item, expiryDate: e.target.value } : item
                                  );
                                  updateData({ ...data, certifications: list });
                                }}
                              />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <label className="text-[11px] font-semibold text-muted-foreground">Credential URL (Optional)</label>
                              <input
                                type="text"
                                placeholder="https://creds.com/verify-id"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                value={cert.url || ""}
                                onChange={(e) => {
                                  const list = (data.certifications || []).map((item) =>
                                    item.id === cert.id ? { ...item, url: e.target.value } : item
                                  );
                                  updateData({ ...data, certifications: list });
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Workshops Section */}
                <div className="space-y-4 pt-4 border-t border-border/20">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Workshops Attended
                    </h3>
                    <Button onClick={() => addAwardRecord("[Workshop] ")} size="sm" className="flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Add Workshop
                    </Button>
                  </div>

                  {(!data.awards || data.awards.filter(a => a.title?.startsWith("[Workshop] ")).length === 0) ? (
                    <div className="text-center py-6 text-muted-foreground text-xs border-2 border-dashed border-border/40 rounded-lg">
                      No workshops added yet.
                    </div>
                  ) : (
                    (data.awards || [])
                      .filter(a => a.title?.startsWith("[Workshop] "))
                      .map((ws, idx) => {
                        const cleanTitle = ws.title?.replace(/^\[Workshop\]\s*/, "") || "";
                        
                        const updateWSField = (field: "title" | "issuer" | "date" | "description", value: string) => {
                          const title = field === "title" ? `[Workshop] ${value}` : ws.title || "";
                          const issuer = field === "issuer" ? value : ws.issuer || "";
                          const date = field === "date" ? value : ws.date || "";
                          const description = field === "description" ? value : ws.description || "";
                          
                          const list = (data.awards || []).map((item) =>
                            item.id === ws.id ? { ...item, title, issuer, date, description } : item
                          );
                          updateData({ ...data, awards: list });
                        };

                        return (
                          <Card key={ws.id} className="glassmorphism">
                            <CardHeader className="py-2.5 flex flex-row items-center justify-between">
                              <CardTitle className="text-xs font-bold">Workshop #{idx + 1}</CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                onClick={() => removeAwardRecord(ws.id || "")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Workshop Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Generative AI & LLMs Bootcamp"
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={cleanTitle}
                                    onChange={(e) => updateWSField("title", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Organizing Institution</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. IEEE Student Chapter"
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={ws.issuer || ""}
                                    onChange={(e) => updateWSField("issuer", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Duration</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 2 Days (Oct 12-13, 2024)"
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={ws.date || ""}
                                    onChange={(e) => updateWSField("date", e.target.value)}
                                  />
                                </div>
                                <div className="col-span-2 space-y-1">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Skills Learned & Achievements</label>
                                  <textarea
                                    rows={2}
                                    placeholder="e.g. Hands-on tuning with HuggingFace, prompt design patterns, built a rag search app."
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={ws.description || ""}
                                    onChange={(e) => updateWSField("description", e.target.value)}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }))
                  }
                </div>
              </div>
            )}

            {/* Tab: Achievements */}
            {activeTab === "achievements" && (
              <div className="space-y-6">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-bold">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Achievements & Awards
                    </CardTitle>
                    <CardDescription>
                      Add hackathon prizes, coding contest ranks, scholarships, academic honors, sports wins, and leadership milestones.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-1">
                    <div className="flex gap-2">
                      <Button onClick={() => addAwardRecord("[Achievement] ")} className="w-full flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Add Achievement / Award
                      </Button>
                    </div>

                    {(!data.awards || data.awards.filter(a => a.title?.startsWith("[Achievement] ")).length === 0) ? (
                      <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border/40 rounded-lg">
                        No achievements added yet.
                      </div>
                    ) : (
                      (data.awards || [])
                        .filter(a => a.title?.startsWith("[Achievement] "))
                        .map((ach, idx) => {
                          const cleanTitle = ach.title?.replace(/^\[Achievement\]\s*/, "") || "";
                          
                          const updateAchField = (field: "title" | "issuer" | "date" | "description", value: string) => {
                            const title = field === "title" ? `[Achievement] ${value}` : ach.title || "";
                            const issuer = field === "issuer" ? value : ach.issuer || "";
                            const date = field === "date" ? value : ach.date || "";
                            const description = field === "description" ? value : ach.description || "";
                            
                            const list = (data.awards || []).map((item) =>
                              item.id === ach.id ? { ...item, title, issuer, date, description } : item
                            );
                            updateData({ ...data, awards: list });
                          };

                          return (
                            <Card key={ach.id} className="glassmorphism mt-2">
                              <CardHeader className="py-2.5 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-bold">Achievement #{idx + 1}</CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                  onClick={() => removeAwardRecord(ach.id || "")}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-muted-foreground">Title / Award Name</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. 1st Place at Smart India Hackathon / 5-Star on CodeChef"
                                      className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                      value={cleanTitle}
                                      onChange={(e) => updateAchField("title", e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-muted-foreground">Issuing Organization / Event</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Ministry of Education / CodeChef"
                                      className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                      value={ach.issuer || ""}
                                      onChange={(e) => updateAchField("issuer", e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-1 col-span-2">
                                    <label className="text-[11px] font-semibold text-muted-foreground">Date / Period</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. March 2024"
                                      className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                      value={ach.date || ""}
                                      onChange={(e) => updateAchField("date", e.target.value)}
                                    />
                                  </div>
                                  <div className="col-span-2 space-y-1">
                                    <label className="text-[11px] font-semibold text-muted-foreground">Short Description (Optional)</label>
                                    <textarea
                                      rows={2}
                                      placeholder="e.g. Ranked 1st out of 500+ teams. Built a smart agriculture system."
                                      className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                      value={ach.description || ""}
                                      onChange={(e) => updateAchField("description", e.target.value)}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab: Extracurricular & Activities */}
            {activeTab === "extracurricular" && (
              <div className="space-y-6">
                {/* Positions of Responsibility */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-primary" />
                      Positions of Responsibility
                    </h3>
                    <Button onClick={() => addAwardRecord("[Responsibility] ")} size="sm">
                      <Plus className="h-3 w-3" /> Add Position
                    </Button>
                  </div>

                  {(!data.awards || data.awards.filter(a => a.title?.startsWith("[Responsibility] ")).length === 0) ? (
                    <div className="text-center py-4 text-muted-foreground text-xs border border-dashed border-border/40 rounded-lg">
                      e.g. Class Representative, Club Lead, Event Coordinator
                    </div>
                  ) : (
                    (data.awards || [])
                      .filter(a => a.title?.startsWith("[Responsibility] "))
                      .map((por, idx) => {
                        const cleanTitle = por.title?.replace(/^\[Responsibility\]\s*/, "") || "";
                        
                        const updatePORField = (field: "title" | "issuer" | "date" | "description", value: string) => {
                          const title = field === "title" ? `[Responsibility] ${value}` : por.title || "";
                          const issuer = field === "issuer" ? value : por.issuer || "";
                          const date = field === "date" ? value : por.date || "";
                          const description = field === "description" ? value : por.description || "";
                          
                          const list = (data.awards || []).map((item) =>
                            item.id === por.id ? { ...item, title, issuer, date, description } : item
                          );
                          updateData({ ...data, awards: list });
                        };

                        return (
                          <Card key={por.id} className="glassmorphism">
                            <CardHeader className="py-2.5 flex flex-row items-center justify-between">
                              <CardTitle className="text-xs font-bold">Position #{idx + 1}</CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                onClick={() => removeAwardRecord(por.id || "")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Position / Role</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Vice President / Lead Organizer"
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={cleanTitle}
                                    onChange={(e) => updatePORField("title", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Club / Event / Community</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Open Source Club / Annual Hackathon"
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={por.issuer || ""}
                                    onChange={(e) => updatePORField("issuer", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Duration</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Aug 2023 - May 2024"
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={por.date || ""}
                                    onChange={(e) => updatePORField("date", e.target.value)}
                                  />
                                </div>
                                <div className="col-span-2 space-y-1">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Description & Key Work</label>
                                  <textarea
                                    rows={2}
                                    placeholder="e.g. Led a team of 15 members to organize a national coding sprint, managing budget..."
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={por.description || ""}
                                    onChange={(e) => updatePORField("description", e.target.value)}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                  )}
                </div>

                {/* Extracurricular Activities */}
                <div className="space-y-4 pt-4 border-t border-border/20">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-primary" />
                      Extracurricular Activities
                    </h3>
                    <Button onClick={() => addAwardRecord("[Extracurricular] ")} size="sm">
                      <Plus className="h-3 w-3" /> Add Activity
                    </Button>
                  </div>

                  {(!data.awards || data.awards.filter(a => a.title?.startsWith("[Extracurricular] ")).length === 0) ? (
                    <div className="text-center py-4 text-muted-foreground text-xs border border-dashed border-border/40 rounded-lg">
                      e.g. Hackathons, Sports, NSS, NCC, Open Source contributions
                    </div>
                  ) : (
                    (data.awards || [])
                      .filter(a => a.title?.startsWith("[Extracurricular] "))
                      .map((act, idx) => {
                        const cleanTitle = act.title?.replace(/^\[Extracurricular\]\s*/, "") || "";
                        
                        const updateActField = (field: "title" | "issuer" | "date" | "description", value: string) => {
                          const title = field === "title" ? `[Extracurricular] ${value}` : act.title || "";
                          const issuer = field === "issuer" ? value : act.issuer || "";
                          const date = field === "date" ? value : act.date || "";
                          const description = field === "description" ? value : act.description || "";
                          
                          const list = (data.awards || []).map((item) =>
                            item.id === act.id ? { ...item, title, issuer, date, description } : item
                          );
                          updateData({ ...data, awards: list });
                        };

                        return (
                          <Card key={act.id} className="glassmorphism">
                            <CardHeader className="py-2.5 flex flex-row items-center justify-between">
                              <CardTitle className="text-xs font-bold">Activity #{idx + 1}</CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                onClick={() => removeAwardRecord(act.id || "")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Activity Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Smart India Hackathon finalist / NSS Volunteer"
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={cleanTitle}
                                    onChange={(e) => updateActField("title", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Role / Detail</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Team Lead / Volunteer Coordinator"
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={act.issuer || ""}
                                    onChange={(e) => updateActField("issuer", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Date / Period</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Feb 2024"
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={act.date || ""}
                                    onChange={(e) => updateActField("date", e.target.value)}
                                  />
                                </div>
                                <div className="col-span-2 space-y-1">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Brief Description</label>
                                  <textarea
                                    rows={2}
                                    placeholder="e.g. Built an IoT-based agriculture dashboard. Pitched solution to industry experts."
                                    className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                    value={act.description || ""}
                                    onChange={(e) => updateActField("description", e.target.value)}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                  )}
                </div>

                {/* Languages */}
                <div className="space-y-4 pt-4 border-t border-border/20">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-primary" />
                      Spoken / Written Languages
                    </h3>
                    <Button onClick={addLanguage} size="sm">
                      <Plus className="h-3 w-3" /> Add Language
                    </Button>
                  </div>

                  {(!data.languages || data.languages.length === 0) ? (
                    <div className="text-center py-4 text-muted-foreground text-xs border border-dashed border-border/40 rounded-lg">
                      Add languages e.g. English, French, Hindi
                    </div>
                  ) : (
                    (data.languages || []).map((lang, idx) => {
                      const parsed = (() => {
                        const prof = lang.proficiency || "";
                        const read = prof.match(/Reading:\s*([^,\n]*)/);
                        const write = prof.match(/Writing:\s*([^,\n]*)/);
                        const speak = prof.match(/Speaking:\s*([^,\n]*)/);
                        return {
                          read: read ? read[1].trim() : "Fluent",
                          write: write ? write[1].trim() : "Fluent",
                          speak: speak ? speak[1].trim() : "Fluent",
                        };
                      })();

                      const updateLangField = (field: "name" | "read" | "write" | "speak", value: string) => {
                        const name = field === "name" ? value : lang.name || "";
                        const r = field === "read" ? value : parsed.read;
                        const w = field === "write" ? value : parsed.write;
                        const s = field === "speak" ? value : parsed.speak;
                        const proficiency = `Reading: ${r}, Writing: ${w}, Speaking: ${s}`;
                        
                        const list = (data.languages || []).map((item) =>
                          item.id === lang.id ? { ...item, name, proficiency } : item
                        );
                        updateData({ ...data, languages: list });
                      };

                      return (
                        <Card key={lang.id} className="glassmorphism">
                          <CardHeader className="py-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-bold">Language #{idx + 1}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => removeLanguage(lang.id || "")}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-muted-foreground">Language Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. English"
                                  className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                  value={lang.name || ""}
                                  onChange={(e) => updateLangField("name", e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-muted-foreground">Speaking Skill</label>
                                <select
                                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                  value={parsed.speak}
                                  onChange={(e) => updateLangField("speak", e.target.value)}
                                >
                                  <option value="Fluent">Fluent / Native</option>
                                  <option value="Intermediate">Conversational / Intermediate</option>
                                  <option value="Basic">Basic / Elementary</option>
                                </select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>

                {/* Interests Section */}
                <div className="space-y-4 pt-4 border-t border-border/20">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Interests
                    </h3>
                  </div>

                  <Card className="glassmorphism">
                    <CardContent className="space-y-3 pt-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="interest-tag-input"
                          placeholder="e.g. Competitive Programming, Chess, Open Source"
                          className="flex-1 rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const input = e.currentTarget;
                              const val = input.value.trim();
                              if (val && !(data.interests || []).some(i => i.name === val)) {
                                updateData({
                                  ...data,
                                  interests: [...(data.interests || []), { id: Math.random().toString(36).substring(2, 9), name: val }]
                                });
                                input.value = "";
                              }
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById("interest-tag-input") as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val && !(data.interests || []).some(i => i.name === val)) {
                              updateData({
                                ...data,
                                interests: [...(data.interests || []), { id: Math.random().toString(36).substring(2, 9), name: val }]
                              });
                              input.value = "";
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(data.interests || []).length === 0 ? (
                          <span className="text-[11px] text-muted-foreground italic">No interests added yet</span>
                        ) : (
                          (data.interests || []).map((int) => (
                            <span
                              key={int.id || int.name}
                              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                            >
                              {int.name}
                              <button
                                type="button"
                                className="text-primary/70 hover:text-primary text-[12px] font-bold ml-1"
                                onClick={() => {
                                  updateData({
                                    ...data,
                                    interests: (data.interests || []).filter(i => i.id !== int.id && i.name !== int.name)
                                  });
                                }}
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* References Section */}
                <div className="space-y-4 pt-4 border-t border-border/20">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <User className="h-4 w-4 text-primary" />
                      Professional References (Optional)
                    </h3>
                    <Button onClick={addReference} size="sm">
                      <Plus className="h-3 w-3" /> Add Reference
                    </Button>
                  </div>

                  {(!data.references || data.references.length === 0) ? (
                    <div className="text-center py-4 text-muted-foreground text-xs border border-dashed border-border/40 rounded-lg">
                      Optional: Add mentors, professors, or team leads.
                    </div>
                  ) : (
                    (data.references || []).map((ref, idx) => (
                      <Card key={ref.id} className="glassmorphism">
                        <CardHeader className="py-2.5 flex flex-row items-center justify-between">
                          <CardTitle className="text-xs font-bold">Reference #{idx + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => removeReference(ref.id || "")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-muted-foreground">Full Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Dr. Jane Doe"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                value={ref.name || ""}
                                onChange={(e) => {
                                  const list = (data.references || []).map((item) =>
                                    item.id === ref.id ? { ...item, name: e.target.value } : item
                                  );
                                  updateData({ ...data, references: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-muted-foreground">Job Title / Designation</label>
                              <input
                                type="text"
                                placeholder="e.g. Professor, Computer Science Dept."
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                value={ref.title || ""}
                                onChange={(e) => {
                                  const list = (data.references || []).map((item) =>
                                    item.id === ref.id ? { ...item, title: e.target.value } : item
                                  );
                                  updateData({ ...data, references: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-muted-foreground">Company / University</label>
                              <input
                                type="text"
                                placeholder="e.g. Stanford University"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                value={ref.company || ""}
                                onChange={(e) => {
                                  const list = (data.references || []).map((item) =>
                                    item.id === ref.id ? { ...item, company: e.target.value } : item
                                  );
                                  updateData({ ...data, references: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-muted-foreground">Email</label>
                              <input
                                type="email"
                                placeholder="jane.doe@univ.edu"
                                className="w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                value={ref.email || ""}
                                onChange={(e) => {
                                  const list = (data.references || []).map((item) =>
                                    item.id === ref.id ? { ...item, email: e.target.value } : item
                                  );
                                  updateData({ ...data, references: list });
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 5: Customization */}
            {activeTab === "customization" && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Resume Customization
                  </CardTitle>
                  <CardDescription>
                    Configure fonts, line spacing, margins, and theme accent colors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Font Family</label>
                    <select
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={customization.fontFamily || "sans"}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          fontFamily: e.target.value as ResumeCustomization["fontFamily"],
                        })
                      }
                    >
                      <option value="sans">Sans-serif (Modern/ATS)</option>
                      <option value="serif">Serif (Traditional/Executive)</option>
                      <option value="mono">Monospace (Technical/Terminal)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Font Size</label>
                    <select
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={customization.fontSize || "md"}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          fontSize: e.target.value as ResumeCustomization["fontSize"],
                        })
                      }
                    >
                      <option value="sm">Small (Compact)</option>
                      <option value="md">Medium (Standard)</option>
                      <option value="lg">Large (Spacious)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Line Spacing</label>
                    <select
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={customization.lineSpacing || "normal"}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          lineSpacing: e.target.value as ResumeCustomization["lineSpacing"],
                        })
                      }
                    >
                      <option value="tight">Tight</option>
                      <option value="normal">Normal</option>
                      <option value="loose">Loose</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Page Margins</label>
                    <select
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={customization.margins || "normal"}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          margins: e.target.value as ResumeCustomization["margins"],
                        })
                      }
                    >
                      <option value="compact">Compact (0.5 inch)</option>
                      <option value="normal">Normal (0.75 inch)</option>
                      <option value="wide">Wide (1.0 inch)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">Theme Accent Color</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Blue", hex: "#2563eb" },
                        { name: "Navy", hex: "#1e3a8a" },
                        { name: "Slate", hex: "#475569" },
                        { name: "Emerald", hex: "#059669" },
                        { name: "Indigo", hex: "#4f46e5" },
                        { name: "Amber", hex: "#d97706" },
                        { name: "Crimson", hex: "#dc2626" },
                        { name: "Purple", hex: "#7c3aed" },
                      ].map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          className={cn(
                            "h-8 w-8 rounded-full border-2 transition-all hover:scale-105",
                            customization.themeColor === color.hex
                              ? "border-foreground ring-2 ring-primary/20 scale-105"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                          onClick={() =>
                            setCustomization({
                              ...customization,
                              themeColor: color.hex,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab 6: Version History */}
            {activeTab === "history" && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <History className="h-4 w-4 text-primary" />
                    Version History
                  </CardTitle>
                  <CardDescription>
                    Log resume snapshots, compare versions, and restore historical drafts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Save manual snapshot */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Save New Snapshot</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Post-review update"
                        className="flex-1 rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={newVersionTitle}
                        onChange={(e) => setNewVersionTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveVersion();
                        }}
                      />
                      <Button onClick={handleSaveVersion}>Save Version</Button>
                    </div>
                  </div>

                  {/* Versions list */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground block border-b border-border/40 pb-1">
                      Saved Snapshots
                    </label>
                    
                    {isVersionsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : dbVersions.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-2">No versions saved yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {dbVersions.map((v) => {
                          const isSource = compareSourceVersionId === v.id;
                          const isTarget = compareTargetVersionId === v.id;
                          return (
                            <div
                              key={v.id}
                              className="flex flex-col gap-2 rounded-lg border border-border bg-background/30 p-3 hover:bg-background/60 transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-bold text-foreground leading-none">{v.title}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    {new Date(v.createdAt).toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleRestoreVersion(v)}
                                  >
                                    Restore
                                  </Button>
                                  <Button
                                    variant={isSource || isTarget ? "default" : "ghost"}
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => {
                                      if (!compareSourceVersionId) {
                                        setCompareSourceVersionId(v.id);
                                      } else if (!compareTargetVersionId && compareSourceVersionId !== v.id) {
                                        setCompareTargetVersionId(v.id);
                                      } else {
                                        setCompareSourceVersionId(v.id);
                                        setCompareTargetVersionId(null);
                                      }
                                    }}
                                  >
                                    {isSource ? "Source" : isTarget ? "Target" : "Compare"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Version Comparison View */}
                  {compareSourceVersionId && (
                    <div className="space-y-3 border-t border-border/40 pt-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Compare Snapshots</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setCompareSourceVersionId(null);
                            setCompareTargetVersionId(null);
                          }}
                        >
                          Clear
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-muted/40 border border-border/50">
                          <span className="font-semibold block text-primary truncate">
                            Source: {dbVersions.find((x) => x.id === compareSourceVersionId)?.title || "Select a version"}
                          </span>
                        </div>
                        <div className="p-2 rounded bg-muted/40 border border-border/50">
                          <span className="font-semibold block text-primary truncate">
                            Target: {compareTargetVersionId ? dbVersions.find((x) => x.id === compareTargetVersionId)?.title : "Select target"}
                          </span>
                        </div>
                      </div>

                      {compareSourceVersionId && compareTargetVersionId && (
                        <div className="rounded-lg border border-border bg-background/50 p-3 space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Summary Difference</span>
                            <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-border/20">
                              <div className="text-destructive bg-destructive/5 p-2 rounded max-h-[150px] overflow-y-auto whitespace-pre-wrap">
                                {dbVersions.find((x) => x.id === compareSourceVersionId)?.data?.summary || "(Empty)"}
                              </div>
                              <div className="text-emerald-700 bg-emerald-500/5 p-2 rounded max-h-[150px] overflow-y-auto whitespace-pre-wrap">
                                {dbVersions.find((x) => x.id === compareTargetVersionId)?.data?.summary || "(Empty)"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Side: Live Resume Preview */}
        <div
          className={cn(
            "flex flex-col space-y-4 overflow-hidden",
            showPreviewMobile ? "flex" : "hidden md:flex"
          )}
        >
          {/* Template Selector bar */}
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Style Template:
            </span>
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              {TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.label}
                </option>
              ))}
            </select>
          </div>

          {/* Paper View Container */}
          <div className="flex-1 overflow-y-auto border border-border/50 bg-background/30 rounded-xl p-4 shadow-inner flex justify-center">
            <div className="printable-resume-container w-full max-w-[800px]">
              <ResumeTemplates data={data} templateId={selectedTemplate} customization={customization} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Photo Crop Modal */}
      {cropImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-background border border-border p-6 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Crop Profile Photo</h3>
              <p className="text-xs text-muted-foreground">Drag to pan the photo, and use the slider below to zoom.</p>
            </div>
            
            {/* Cropping Canvas Frame */}
            <div 
              className="relative h-64 w-full overflow-hidden rounded-lg bg-zinc-950 cursor-move select-none border border-border flex items-center justify-center"
              onMouseDown={startDrag}
              onMouseMove={drag}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={startDragTouch}
              onTouchMove={dragTouch}
              onTouchEnd={endDrag}
            >
              {/* Darkened Bounding Overlay with Circular Hole */}
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                <div className="h-48 w-48 rounded-full border-2 border-white shadow-[0_0_0_9999px_rgba(9,9,11,0.7)]" />
              </div>
              
              {/* Draggable preview image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cropImageSrc}
                alt="To Crop"
                className="absolute origin-center max-w-none pointer-events-none"
                style={{
                  width: `${imageDimensions.width}px`,
                  height: `${imageDimensions.height}px`,
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  left: "50%",
                  top: "50%",
                  marginTop: `-${imageDimensions.height / 2}px`,
                  marginLeft: `-${imageDimensions.width / 2}px`,
                }}
              />
            </div>

            {/* Slider zoom */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Zoom Level</span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <Button 
                variant="outline" 
                size="sm" 
                type="button"
                onClick={() => setCropImageSrc(null)}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                type="button"
                onClick={cropAndSave}
              >
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
