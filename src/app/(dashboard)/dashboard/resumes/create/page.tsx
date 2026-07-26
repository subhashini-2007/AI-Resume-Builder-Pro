"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

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
    avatar: "",
    summary: "",
  },
  experiences: [],
  educations: [],
  skills: [],
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
    "personal" | "experience" | "education" | "skills" | "customization" | "history"
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

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [draggedType, setDraggedType] = React.useState<"experience" | "education" | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number, type: "experience" | "education") => {
    setDraggedIndex(index);
    setDraggedType(type);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number, type: "experience" | "education") => {
    e.preventDefault();
    if (draggedIndex === null || draggedType !== type || draggedIndex === index) return;

    if (type === "experience") {
      const list = [...data.experiences];
      const draggedItem = list[draggedIndex];
      list.splice(draggedIndex, 1);
      list.splice(index, 0, draggedItem);
      setDraggedIndex(index);
      updateData({ ...data, experiences: list });
    } else {
      const list = [...data.educations];
      const draggedItem = list[draggedIndex];
      list.splice(draggedIndex, 1);
      list.splice(index, 0, draggedItem);
      setDraggedIndex(index);
      updateData({ ...data, educations: list });
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
            const parts = fetched.selectedTemplate.split("?");
            setSelectedTemplate(parts[0]);
            if (parts[1]) {
              const params = new URLSearchParams(parts[1]);
              setCustomization({
                fontFamily: (params.get("fontFamily") as any) || "sans",
                fontSize: (params.get("fontSize") as any) || "md",
                lineSpacing: (params.get("lineSpacing") as any) || "normal",
                margins: (params.get("margins") as any) || "normal",
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
          <div className="flex gap-2 overflow-x-auto border-b border-border/40 pb-2">
            {(["personal", "experience", "education", "skills", "customization", "history"] as const).map((tab) => (
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
                        Full Name
                      </label>
                      <input
                        type="text"
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
                        Professional Title
                      </label>
                      <input
                        type="text"
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
                      <label className="text-xs font-semibold text-muted-foreground">Email</label>
                      <input
                        type="email"
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
                      <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                      <input
                        type="text"
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
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Location
                      </label>
                      <input
                        type="text"
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
            )}

            {/* Tab 2: Work Experience */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                <Button onClick={addExperience} className="w-full flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Work Experience
                </Button>

                {data.experiences.map((exp, idx) => (
                  <Card
                    key={exp.id}
                    className={cn(
                      "glassmorphism transition-all duration-200",
                      draggedIndex === idx && draggedType === "experience" ? "opacity-40 scale-[0.98] border-primary/40 bg-primary/5" : ""
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx, "experience")}
                    onDragOver={(e) => handleDragOver(e, idx, "experience")}
                    onDragEnd={handleDragEnd}
                  >
                    <CardHeader className="py-3 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <Briefcase className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-bold">Position #{idx + 1}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shiftExperience(idx, "up")}
                          disabled={idx === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shiftExperience(idx, "down")}
                          disabled={idx === data.experiences.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeExperience(exp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Company
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={exp.company}
                            onChange={(e) => {
                              const newExps = data.experiences.map((item) =>
                                item.id === exp.id ? { ...item, company: e.target.value } : item
                              );
                              updateData({ ...data, experiences: newExps });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Role / Job Title
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={exp.role}
                            onChange={(e) => {
                              const newExps = data.experiences.map((item) =>
                                item.id === exp.id ? { ...item, role: e.target.value } : item
                              );
                              updateData({ ...data, experiences: newExps });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Start Date
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. June 2021"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={exp.startDate}
                            onChange={(e) => {
                              const newExps = data.experiences.map((item) =>
                                item.id === exp.id ? { ...item, startDate: e.target.value } : item
                              );
                              updateData({ ...data, experiences: newExps });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            End Date
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Present"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={exp.endDate}
                            onChange={(e) => {
                              const newExps = data.experiences.map((item) =>
                                item.id === exp.id ? { ...item, endDate: e.target.value } : item
                              );
                              updateData({ ...data, experiences: newExps });
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Description & Contributions
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
                          className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                          value={exp.description}
                          onChange={(e) => {
                            const newExps = data.experiences.map((item) =>
                              item.id === exp.id ? { ...item, description: e.target.value } : item
                            );
                            updateData({ ...data, experiences: newExps });
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            School / University
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={edu.school}
                            onChange={(e) => {
                              const newEdus = data.educations.map((item) =>
                                item.id === edu.id ? { ...item, school: e.target.value } : item
                              );
                              updateData({ ...data, educations: newEdus });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Degree / Course
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. B.S. Computer Science"
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
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Start Date
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Sept 2017"
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
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            End Date (Or Expected)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. May 2021"
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
            {activeTab === "skills" && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Skills List
                  </CardTitle>
                  <CardDescription>
                    Add technical skills, programming languages, and tools.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Skill Add Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="skill-input"
                      placeholder="e.g. Next.js"
                      className="flex-1 rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const input = e.currentTarget;
                          addSkill(input.value);
                          input.value = "";
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById("skill-input") as HTMLInputElement;
                        if (input) {
                          addSkill(input.value);
                          input.value = "";
                        }
                      }}
                    >
                      Add Skill
                    </Button>
                  </div>

                  {/* Skills Grid */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {data.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {skill}
                        <button
                          type="button"
                          className="text-primary/70 hover:text-primary"
                          onClick={() => removeSkill(skill)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
