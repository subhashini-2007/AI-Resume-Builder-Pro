import {
  LayoutDashboard,
  FilePlus,
  FileText,
  PanelsTopLeft,
  Sparkles,
  ShieldCheck,
  FileEdit,
  GraduationCap,
  Milestone,
  Settings,
  HelpCircle,
} from "lucide-react";
import { NavigationItem } from "@/types";

export const publicNavItems: NavigationItem[] = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export const sidebarMainItems: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/resumes/create", label: "Create Resume", icon: FilePlus },
  { href: "/dashboard/resumes", label: "My Resumes", icon: FileText },
  { href: "/dashboard/templates", label: "Resume Templates", icon: PanelsTopLeft },
];

export const sidebarAiItems: NavigationItem[] = [
  { href: "/dashboard/ai-generator", label: "AI Resume Generator", icon: Sparkles },
  { href: "/dashboard/ats-checker", label: "ATS Score Checker", icon: ShieldCheck },
  { href: "/dashboard/cover-letter", label: "Cover Letter Generator", icon: FileEdit },
  { href: "/dashboard/interview-prep", label: "Interview Preparation", icon: GraduationCap },
  { href: "/dashboard/career-roadmap", label: "Career Roadmap", icon: Milestone },
];

export const sidebarSupportItems: NavigationItem[] = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/help", label: "Help & Support", icon: HelpCircle },
];
