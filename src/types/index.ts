import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  icon?: LucideIcon;
}

export interface UserSession {
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface ResumeMetadata {
  id: string;
  title: string;
  updatedAt: string;
  status: "Draft" | "Published";
  score?: number;
}
