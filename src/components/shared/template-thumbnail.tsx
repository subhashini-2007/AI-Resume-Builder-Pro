import * as React from "react";
import { cn } from "@/lib/utils";

interface TemplateThumbnailProps {
  templateId: string;
  className?: string;
}

export function TemplateThumbnail({ templateId, className }: TemplateThumbnailProps) {
  interface LineProps {
    width?: string;
    color?: string;
    height?: string;
    className?: string;
  }

  // Mini line helper
  const Line = ({
    width = "w-full",
    color = "bg-muted-foreground/30",
    height = "h-1",
    className,
  }: LineProps) => <div className={cn(height, width, color, "rounded-full", className)} />;

  const TitleLine = ({ width = "w-12" }: { width?: string }) => (
    <Line width={width} color="bg-primary/40" height="h-1.5" />
  );

  // 1. ATS Classic: Centered header, single column
  const renderAtsClassic = () => (
    <div className="flex h-full w-full flex-col gap-2.5 bg-white p-3">
      <div className="flex flex-col items-center gap-1 border-b border-border/40 pb-1.5">
        <Line width="w-20" color="bg-slate-900" height="h-2" />
        <Line width="w-12" color="bg-slate-500" />
        <div className="flex w-full justify-center gap-1.5">
          <Line width="w-8" />
          <Line width="w-8" />
        </div>
      </div>
      <div className="space-y-1.5">
        <TitleLine />
        <Line width="w-full" />
        <Line width="w-5/6" />
      </div>
      <div className="space-y-1.5">
        <TitleLine />
        <Line width="w-full" />
        <Line width="w-4/5" />
      </div>
    </div>
  );

  // 2. Modern: Left sidebar (dark), right main (light)
  const renderModern = () => (
    <div className="flex h-full w-full bg-white">
      {/* Mini Sidebar */}
      <div className="flex w-1/3 flex-col gap-3 bg-slate-900 p-2">
        <div className="flex flex-col items-center gap-1">
          <div className="h-5 w-5 rounded-full bg-slate-700" />
          <Line width="w-8" color="bg-white" height="h-1" />
        </div>
        <div className="space-y-1">
          <Line width="w-10" color="bg-slate-400" />
          <Line width="w-6" color="bg-slate-500" />
        </div>
        <div className="space-y-1">
          <Line width="w-12" color="bg-slate-400" />
          <Line width="w-8" color="bg-slate-500" />
        </div>
      </div>
      {/* Mini Main */}
      <div className="flex w-2/3 flex-col gap-2.5 p-3">
        <div className="space-y-1.5">
          <TitleLine width="w-16" />
          <Line width="w-full" />
          <Line width="w-5/6" />
        </div>
        <div className="space-y-1.5">
          <TitleLine width="w-16" />
          <Line width="w-full" />
          <Line width="w-4/5" />
        </div>
      </div>
    </div>
  );

  // 3. Minimal: Left margin dates, right items
  const renderMinimal = () => (
    <div className="flex h-full w-full flex-col gap-3.5 bg-white p-3">
      <div>
        <Line width="w-16" color="bg-slate-950" height="h-2" />
        <Line width="w-10" color="bg-slate-400" className="mt-1" />
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-2">
          <Line width="w-full" color="bg-slate-300" />
          <div className="col-span-3 space-y-1">
            <Line width="w-12" color="bg-slate-900" />
            <Line width="w-full" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Line width="w-full" color="bg-slate-300" />
          <div className="col-span-3 space-y-1">
            <Line width="w-16" color="bg-slate-900" />
            <Line width="w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );

  // 4. Executive: Clean centered lines, serif font-like look
  const renderExecutive = () => (
    <div className="flex h-full w-full flex-col gap-3 border-2 border-double border-slate-100 bg-white p-3">
      <div className="flex flex-col items-center gap-1 border-b-2 border-slate-900 pb-1.5">
        <Line width="w-24" color="bg-slate-950" height="h-2.5" />
        <Line width="w-14" color="bg-slate-600" />
      </div>
      <div className="space-y-1.5">
        <TitleLine width="w-14" />
        <Line width="w-full" />
        <Line width="w-4/5" />
      </div>
      <div className="space-y-1.5">
        <TitleLine width="w-14" />
        <Line width="w-full" />
        <Line width="w-5/6" />
      </div>
    </div>
  );

  // 5. Creative: Header banner (gradient violet), bottom columns
  const renderCreative = () => (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 p-2.5">
        <div className="h-4 w-4 rounded-full bg-white/30" />
        <div className="space-y-0.5">
          <Line width="w-16" color="bg-white" height="h-1.5" />
          <Line width="w-8" color="bg-white/70" />
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2.5 p-3">
        <div className="col-span-2 space-y-2">
          <TitleLine width="w-12" />
          <Line width="w-full" />
          <Line width="w-4/5" />
        </div>
        <div className="col-span-1 space-y-2 border-l border-border/40 pl-2">
          <TitleLine width="w-8" />
          <div className="flex flex-wrap gap-1">
            <Line width="w-6" />
            <Line width="w-4" />
          </div>
        </div>
      </div>
    </div>
  );

  // 6. Corporate: Left blue border, single column
  const renderCorporate = () => (
    <div className="flex h-full w-full flex-col gap-3 bg-white p-3">
      <div className="border-l-2 border-blue-900 pl-2">
        <Line width="w-20" color="bg-slate-900" height="h-2" />
        <Line width="w-10" color="bg-blue-900" className="mt-1" />
      </div>
      <div className="space-y-1.5">
        <TitleLine width="w-16" />
        <Line width="w-full" />
        <Line width="w-5/6" />
      </div>
      <div className="space-y-1.5">
        <TitleLine width="w-16" />
        <Line width="w-full" />
        <Line width="w-4/5" />
      </div>
    </div>
  );

  // 7. Elegant: Warm background, amber accents
  const renderElegant = () => (
    <div className="flex h-full w-full flex-col items-center gap-2.5 bg-amber-50/20 p-3">
      <div className="mb-1 flex flex-col items-center gap-1">
        <Line width="w-16" color="bg-slate-900" height="h-2" />
        <Line width="w-12" color="bg-amber-800" />
      </div>
      <div className="w-full space-y-1.5">
        <Line width="w-12" color="bg-amber-700" className="mx-auto" />
        <Line width="w-full" />
        <Line width="w-5/6" />
      </div>
      <div className="w-full space-y-1.5">
        <Line width="w-12" color="bg-amber-700" className="mx-auto" />
        <Line width="w-full" />
        <Line width="w-4/5" />
      </div>
    </div>
  );

  // 8. Compact: Dense spaced lines
  const renderCompact = () => (
    <div className="flex h-full w-full flex-col gap-2 bg-white p-2.5">
      <div className="flex justify-between border-b border-border/30 pb-1">
        <div className="space-y-0.5">
          <Line width="w-16" color="bg-slate-950" height="h-1.5" />
          <Line width="w-8" color="bg-slate-500" />
        </div>
        <Line width="w-10" />
      </div>
      <div className="space-y-1">
        <Line width="w-full" />
        <Line width="w-full" />
      </div>
      <div className="space-y-1">
        <Line width="w-14" color="bg-slate-900" />
        <Line width="w-full" />
      </div>
    </div>
  );

  // 9. Student: Education first
  const renderStudent = () => (
    <div className="flex h-full w-full flex-col gap-2.5 bg-white p-3">
      <div className="border-b border-border/40 pb-1.5">
        <Line width="w-20" color="bg-slate-950" height="h-2" />
        <Line width="w-12" color="bg-slate-500" className="mt-1" />
      </div>
      {/* Education */}
      <div className="space-y-1.5">
        <TitleLine width="w-12" />
        <div className="flex justify-between">
          <Line width="w-16" color="bg-slate-900" />
          <Line width="w-8" />
        </div>
      </div>
      {/* Skills */}
      <div className="space-y-1">
        <TitleLine width="w-12" />
        <Line width="w-full" />
      </div>
      {/* Experience */}
      <div className="space-y-1.5">
        <TitleLine width="w-12" />
        <Line width="w-full" />
      </div>
    </div>
  );

  // 10. Developer: Dark terminal look
  const renderDeveloper = () => (
    <div className="flex h-full w-full flex-col gap-2.5 bg-slate-950 p-3 font-mono">
      <div className="border-b border-emerald-900 pb-1.5">
        <Line width="w-16" color="bg-emerald-400" height="h-1.5" />
        <Line width="w-10" color="bg-emerald-500" className="mt-1" />
      </div>
      <div className="space-y-1">
        <Line width="w-8" color="bg-emerald-500" />
        <Line width="w-full" color="bg-emerald-700" />
      </div>
      <div className="space-y-1">
        <Line width="w-8" color="bg-emerald-500" />
        <Line width="w-full" color="bg-emerald-700" />
      </div>
    </div>
  );

  return (
    <div
      className={cn("relative h-full w-full select-none overflow-hidden bg-muted/40", className)}
    >
      {templateId === "ats-classic" && renderAtsClassic()}
      {templateId === "modern" && renderModern()}
      {templateId === "minimal" && renderMinimal()}
      {templateId === "executive" && renderExecutive()}
      {templateId === "creative" && renderCreative()}
      {templateId === "corporate" && renderCorporate()}
      {templateId === "elegant" && renderElegant()}
      {templateId === "compact" && renderCompact()}
      {templateId === "student" && renderStudent()}
      {templateId === "developer" && renderDeveloper()}
    </div>
  );
}
