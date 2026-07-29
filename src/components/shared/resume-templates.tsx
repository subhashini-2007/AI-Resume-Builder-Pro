import React, { memo } from "react";
import { cn } from "@/lib/utils";

export interface ResumeData {
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
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
    avatar: string; // Base64 image
    summary: string;
  };
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  educations: Array<{
    id: string;
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    fieldOfStudy?: string;
    grade?: string;
  }>;
  skills: string[];
  projects?: Array<{
    id?: string;
    name: string;
    description: string;
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
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate?: string;
    expiryDate?: string;
    url?: string;
  }>;
  languages?: Array<{
    id: string;
    name: string;
    proficiency: string;
  }>;
  awards?: Array<{
    id: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
  interests?: Array<{
    id: string;
    name: string;
  }>;
  references?: Array<{
    id: string;
    name: string;
    title?: string;
    company: string;
    email: string;
    phone?: string;
  }>;
}

export interface ResumeCustomization {
  fontFamily?: "sans" | "serif" | "mono";
  fontSize?: "sm" | "md" | "lg";
  lineSpacing?: "tight" | "normal" | "loose";
  margins?: "compact" | "normal" | "wide";
  themeColor?: string;
}

interface ResumeTemplatesProps {
  templateId: string;
  data: ResumeData;
  className?: string;
  customization?: ResumeCustomization;
}

export const ResumeTemplates = memo(function ResumeTemplates(props: ResumeTemplatesProps) {
  const { templateId, data, className, customization } = props;
  const { personalInfo, experiences, educations, skills } = data;

  const { fontFamily, fontSize, lineSpacing, margins, themeColor } = customization || {};

  // Customization mappings
  const fontClass =
    fontFamily === "serif" ? "font-serif" : fontFamily === "mono" ? "font-mono" : "font-sans";

  const sizeClass =
    fontSize === "sm" ? "text-[10px]" : fontSize === "lg" ? "text-[13px]" : "text-[11px]";

  const leadingClass =
    lineSpacing === "tight" ? "leading-tight" : lineSpacing === "loose" ? "leading-loose" : "leading-normal";

  const paddingClass =
    margins === "compact" ? "p-4 md:p-5" : margins === "wide" ? "p-10 md:p-12" : "p-8 md:p-10";

  const accentColor = themeColor || "#2563eb"; // default blue-650
  const accentStyle = { color: accentColor };
  const accentBorderStyle = { borderColor: accentColor };
  const accentBgStyle = { backgroundColor: accentColor };

  // Render Experience description with basic HTML formatting
  const renderDescription = (desc: string) => {
    return (
      <div
        className="space-y-1 text-xs leading-relaxed"
        dangerouslySetInnerHTML={{ __html: desc }}
      />
    );
  };

  // Helper: Render Social/Professional Profiles (Horizontal)
  const renderSocialProfiles = () => {
    const profiles = [
      { url: personalInfo.linkedinUrl, label: "LinkedIn", icon: "🔗" },
      { url: personalInfo.githubUrl, label: "GitHub", icon: "💻" },
      { url: personalInfo.portfolioUrl, label: "Portfolio", icon: "🌐" },
      { url: personalInfo.leetcodeUrl, label: "LeetCode", icon: "🧠" },
      { url: personalInfo.hackerrankUrl, label: "HackerRank", icon: "🏆" },
      { url: personalInfo.kaggleUrl, label: "Kaggle", icon: "📊" },
      { url: personalInfo.mediumUrl, label: "Medium", icon: "📝" },
      { url: personalInfo.stackoverflowUrl, label: "StackOverflow", icon: "💬" },
      { url: personalInfo.behanceUrl, label: "Behance", icon: "🎨" },
      { url: personalInfo.dribbbleUrl, label: "Dribbble", icon: "🏀" },
      { url: personalInfo.twitterUrl, label: "Twitter", icon: "🐦" },
      { url: personalInfo.youtubeUrl, label: "YouTube", icon: "📺" },
      { url: personalInfo.devtoUrl, label: "Dev.to", icon: "💻" },
      { url: personalInfo.researchgateUrl, label: "ResearchGate", icon: "🔬" },
      { url: personalInfo.orcidUrl, label: "ORCID", icon: "🆔" },
      { url: personalInfo.googleScholarUrl, label: "Scholar", icon: "🎓" },
      { url: personalInfo.otherLinkUrl, label: personalInfo.otherLinkLabel || "Link", icon: "🔗" },
    ].filter((p) => p.url);

    if (profiles.length === 0) return null;

    return (
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400">
        {profiles.map((p, idx) => (
          <a
            key={idx}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 font-medium transition-colors"
            style={{ color: accentColor }}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </a>
        ))}
      </div>
    );
  };

  // Helper: Render Social/Professional Profiles (Vertical)
  const renderSocialProfilesVertical = () => {
    const profiles = [
      { url: personalInfo.linkedinUrl, label: "LinkedIn", icon: "🔗" },
      { url: personalInfo.githubUrl, label: "GitHub", icon: "💻" },
      { url: personalInfo.portfolioUrl, label: "Portfolio", icon: "🌐" },
      { url: personalInfo.leetcodeUrl, label: "LeetCode", icon: "🧠" },
      { url: personalInfo.hackerrankUrl, label: "HackerRank", icon: "🏆" },
      { url: personalInfo.kaggleUrl, label: "Kaggle", icon: "📊" },
      { url: personalInfo.mediumUrl, label: "Medium", icon: "📝" },
      { url: personalInfo.stackoverflowUrl, label: "StackOverflow", icon: "💬" },
      { url: personalInfo.behanceUrl, label: "Behance", icon: "🎨" },
      { url: personalInfo.dribbbleUrl, label: "Dribbble", icon: "🏀" },
      { url: personalInfo.twitterUrl, label: "Twitter", icon: "🐦" },
      { url: personalInfo.youtubeUrl, label: "YouTube", icon: "📺" },
      { url: personalInfo.devtoUrl, label: "Dev.to", icon: "💻" },
      { url: personalInfo.researchgateUrl, label: "ResearchGate", icon: "🔬" },
      { url: personalInfo.orcidUrl, label: "ORCID", icon: "🆔" },
      { url: personalInfo.googleScholarUrl, label: "Scholar", icon: "🎓" },
      { url: personalInfo.otherLinkUrl, label: personalInfo.otherLinkLabel || "Link", icon: "🔗" },
    ].filter((p) => p.url);

    if (profiles.length === 0) return null;

    return (
      <div className="space-y-1.5 text-[10px] text-slate-300">
        {profiles.map((p, idx) => (
          <p key={idx}>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1 font-medium text-slate-300 hover:text-white"
            >
              <span>{p.icon}</span>
              <span className="truncate">{p.label}</span>
            </a>
          </p>
        ))}
      </div>
    );
  };

  // Helper: Render Projects Section
  const renderProjectsSection = (styleTheme?: "default" | "dark" | "minimal" | "student") => {
    const projList = data.projects || [];
    if (projList.length === 0) return null;

    return (
      <div className="mb-4">
        {styleTheme === "dark" ? (
          <h3 className="mb-3 border-b pb-0.5 text-xs font-bold uppercase tracking-wider text-emerald-400" style={accentBorderStyle}>
            [3] Projects
          </h3>
        ) : styleTheme === "minimal" ? (
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-800" style={accentStyle}>
            Projects
          </h3>
        ) : (
          <h3 className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider" style={{ ...accentStyle, ...accentBorderStyle }}>
            Projects
          </h3>
        )}

        <div className="space-y-4">
          {projList.map((proj, idx) => (
            <div key={proj.id || idx}>
              {/* Project Title, Type, Status, Duration */}
              <div className="flex items-start justify-between font-semibold text-slate-900 dark:text-slate-100">
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-bold text-sm" style={{ color: styleTheme === "dark" ? "#34d399" : undefined }}>{proj.name}</span>
                  {proj.role && <span className="text-xs text-slate-500 dark:text-slate-450">({proj.role})</span>}
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-650 dark:text-slate-350">
                    {proj.projectType}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${proj.status === "Ongoing" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {proj.status}
                  </span>
                </div>
                <span className="font-normal text-slate-500 text-[10px]">
                  {proj.duration}
                </span>
              </div>

              {/* Client & Team */}
              {(proj.clientName || proj.teamSize) && (
                <div className="mt-0.5 flex gap-4 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {proj.clientName && <span>Client: {proj.clientName}</span>}
                  {proj.teamSize && <span>Team Size: {proj.teamSize}</span>}
                </div>
              )}

              {/* Technologies */}
              {proj.technologies && (
                <div className="mt-1 text-[10px]">
                  <span className="font-semibold text-slate-705 dark:text-slate-300">Technologies:</span>{" "}
                  <span className="text-slate-600 dark:text-slate-400 font-mono">{proj.technologies}</span>
                </div>
              )}

              {/* Description */}
              {proj.description && (
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {proj.description}
                </p>
              )}

              {/* Responsibilities */}
              {proj.responsibilities && (
                <div className="mt-1 text-xs text-slate-650 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Responsibilities:</span> {proj.responsibilities}
                </div>
              )}

              {/* Key Features */}
              {proj.keyFeatures && proj.keyFeatures.length > 0 && (
                <div className="mt-1">
                  <span className="text-[10px] font-semibold text-slate-705 dark:text-slate-300">Key Features:</span>
                  <ul className="list-disc pl-5 mt-0.5 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                    {proj.keyFeatures.map((kf, kidx) => kf && <li key={kidx}>{kf}</li>)}
                  </ul>
                </div>
              )}

              {/* Achievements */}
              {proj.achievements && proj.achievements.length > 0 && (
                <div className="mt-1">
                  <span className="text-[10px] font-semibold text-slate-705 dark:text-slate-300">Achievements:</span>
                  <ul className="list-disc pl-5 mt-0.5 text-xs text-slate-650 dark:text-slate-400 space-y-0.5">
                    {proj.achievements.map((ach, aidx) => ach && <li key={aidx}>{ach}</li>)}
                  </ul>
                </div>
              )}

              {/* Repository & Live Demo & Documentation links */}
              {(proj.githubUrl || proj.liveUrl || proj.documentationUrl) && (
                <div className="mt-2 flex gap-4 text-[10px]">
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold flex items-center gap-1" style={{ color: accentColor }}>
                      Code Repo 💻
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold flex items-center gap-1" style={{ color: accentColor }}>
                      Live Demo 🚀
                    </a>
                  )}
                  {proj.documentationUrl && (
                    <a href={proj.documentationUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold flex items-center gap-1" style={{ color: accentColor }}>
                      Docs 📄
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 1. ATS Classic Template
  const renderAtsClassic = () => (
    <div className={cn("h-full bg-white text-slate-800", paddingClass, fontClass, sizeClass, leadingClass)}>
      {/* Header */}
      <div className="mb-4 border-b pb-4 text-center" style={accentBorderStyle}>
        <h1 className="text-xl font-bold uppercase tracking-tight" style={accentStyle}>
          {personalInfo.fullName || "Your Name"}
        </h1>
        <p className="mt-1 text-xs font-semibold text-slate-600">
          {personalInfo.title || "Professional Title"}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
        </div>
        {renderSocialProfiles()}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-4">
          <h3 className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider" style={{ ...accentStyle, ...accentBorderStyle }}>
            Professional Summary
          </h3>
          {renderDescription(personalInfo.summary)}
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider" style={{ ...accentStyle, ...accentBorderStyle }}>
            Work Experience
          </h3>
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between font-semibold text-slate-900">
                  <span>
                    {exp.role} — {exp.company}
                  </span>
                  <span className="font-normal text-slate-500 text-[10px]">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="mt-1">{renderDescription(exp.description)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {renderProjectsSection()}

      {/* Education */}
      {educations.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider" style={{ ...accentStyle, ...accentBorderStyle }}>
            Education
          </h3>
          <div className="space-y-2">
            {educations.map((edu) => (
              <div key={edu.id} className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-900">{edu.school}</span>
                  <span className="block text-slate-600 text-[10px]">{edu.degree}</span>
                </div>
                <span className="font-medium text-slate-500 text-[10px]">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h3 className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider" style={{ ...accentStyle, ...accentBorderStyle }}>
            Core Skills
          </h3>
          <p className="text-slate-700">{skills.join(" • ")}</p>
        </div>
      )}
    </div>
  );

  // 2. Modern Template
  const renderModern = () => (
    <div className={cn("grid h-full grid-cols-3 bg-white text-slate-700", fontClass, sizeClass, leadingClass)}>
      {/* Sidebar Panel */}
      <div className="col-span-1 flex flex-col justify-between bg-slate-900 p-6 text-slate-200">
        <div className="space-y-6">
          <div className="text-center">
            {personalInfo.avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={personalInfo.avatar}
                alt="Avatar"
                className="mx-auto mb-4 h-20 w-20 rounded-full border-2 object-cover"
                style={accentBorderStyle}
              />
            )}
            <h2 className="text-base font-bold uppercase text-white">
              {personalInfo.fullName || "Your Name"}
            </h2>
            <p className="mt-1 text-[10px] font-semibold text-slate-400">{personalInfo.title}</p>
          </div>

          <div className="space-y-3">
            <h3 className="border-b pb-1 text-[10px] font-bold uppercase tracking-wider text-white" style={accentBorderStyle}>
              Contact Info
            </h3>
            <div className="space-y-1.5 text-[10px] text-slate-300">
              {personalInfo.email && <p className="truncate">{personalInfo.email}</p>}
              {personalInfo.phone && <p>{personalInfo.phone}</p>}
              {personalInfo.location && <p>{personalInfo.location}</p>}
              {personalInfo.website && <p className="truncate">{personalInfo.website}</p>}
            </div>
            {renderSocialProfilesVertical()}
          </div>

          {skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="border-b pb-1 text-[10px] font-bold uppercase tracking-wider text-white" style={accentBorderStyle}>
                Core Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded border bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-200"
                    style={accentBorderStyle}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("col-span-2", paddingClass)}>
        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-6">
            <h3 className="mb-2.5 border-b pb-1 text-xs font-bold text-slate-900" style={accentBorderStyle}>
              Profile Summary
            </h3>
            {renderDescription(personalInfo.summary)}
          </div>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 border-b pb-1 text-xs font-bold text-slate-900" style={accentBorderStyle}>
              Professional Experience
            </h3>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-start justify-between font-bold text-slate-900">
                    <span>{exp.role}</span>
                    <span className="text-[10px] font-medium text-slate-500">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                    {exp.company}
                  </div>
                  <div className="mt-2 text-slate-600">{renderDescription(exp.description)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {renderProjectsSection()}

        {/* Education */}
        {educations.length > 0 && (
          <div>
            <h3 className="mb-3 border-b pb-1 text-xs font-bold text-slate-900" style={accentBorderStyle}>
              Education
            </h3>
            <div className="space-y-3">
              {educations.map((edu) => (
                <div key={edu.id} className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-955">{edu.school}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-500">{edu.degree}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 3. Minimal Template
  const renderMinimal = () => (
    <div className={cn("h-full bg-white text-slate-700", paddingClass, fontClass, sizeClass, leadingClass)}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight" style={accentStyle}>
          {personalInfo.fullName || "Your Name"}
        </h1>
        <p className="mt-0.5 text-xs font-medium text-slate-500">{personalInfo.title}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
        </div>
        {renderSocialProfiles()}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h3 className="mb-2 text-xs font-semibold" style={accentStyle}>About</h3>
          <div className="text-slate-600">{renderDescription(personalInfo.summary)}</div>
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold" style={accentStyle}>Experience</h3>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="grid grid-cols-4 gap-4">
                <span className="col-span-1 text-[10px] font-medium text-slate-400">
                  {exp.startDate} - {exp.endDate}
                </span>
                <div className="col-span-3">
                  <div className="font-bold text-slate-900">
                    {exp.role} <span className="font-normal text-slate-400">at</span> {exp.company}
                  </div>
                  <div className="mt-1 text-slate-600">{renderDescription(exp.description)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {renderProjectsSection("minimal")}

      {/* Education */}
      {educations.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold" style={accentStyle}>Education</h3>
          <div className="space-y-3">
            {educations.map((edu) => (
              <div key={edu.id} className="grid grid-cols-4 gap-4">
                <span className="col-span-1 text-[10px] font-medium text-slate-400">
                  {edu.startDate} - {edu.endDate}
                </span>
                <div className="col-span-3">
                  <div className="font-bold text-slate-900">{edu.school}</div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{edu.degree}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold" style={accentStyle}>Skills</h3>
          <div className="flex flex-wrap gap-1">
            {skills.map((s, idx) => (
              <span
                key={idx}
                className="rounded border px-1.5 py-0.5 text-[9px] font-medium"
                style={{ ...accentBorderStyle, color: accentColor }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 4. Executive Template
  const renderExecutive = () => (
    <div className={cn("h-full bg-white text-slate-800", paddingClass, fontClass, sizeClass, leadingClass)}>
      {/* Centered Rich Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900" style={accentStyle}>
          {personalInfo.fullName || "Your Name"}
        </h1>
        <p className="mt-1 text-xs italic text-slate-600">{personalInfo.title}</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-[10px] text-slate-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
        </div>
        {renderSocialProfiles()}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-5">
          <h3 className="mb-2 border-b-2 pb-1 font-sans text-xs font-bold uppercase tracking-wider text-slate-955" style={{ ...accentStyle, ...accentBorderStyle }}>
            Executive Profile
          </h3>
          {renderDescription(personalInfo.summary)}
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3.5 border-b-2 pb-1 font-sans text-xs font-bold uppercase tracking-wider text-slate-955" style={{ ...accentStyle, ...accentBorderStyle }}>
            Professional Highlights
          </h3>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between font-bold text-slate-955">
                  <span>
                    {exp.role}{" "}
                    <span className="font-normal italic text-slate-500">| {exp.company}</span>
                  </span>
                  <span className="text-[10px] font-normal italic text-slate-500">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="text-slate-650 mt-1">{renderDescription(exp.description)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {renderProjectsSection()}

      {/* Education */}
      {educations.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3 border-b-2 pb-1 font-sans text-xs font-bold uppercase tracking-wider text-slate-955" style={{ ...accentStyle, ...accentBorderStyle }}>
            Credentials
          </h3>
          <div className="space-y-2">
            {educations.map((edu) => (
              <div key={edu.id} className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-955">{edu.school}</span>
                  <span className="mt-0.5 block text-[10px] text-slate-600">{edu.degree}</span>
                </div>
                <span className="text-[10px] italic text-slate-500">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h3 className="mb-2 border-b-2 pb-1 font-sans text-xs font-bold uppercase tracking-wider text-slate-955" style={{ ...accentStyle, ...accentBorderStyle }}>
            Areas of Expertise
          </h3>
          <p className="text-slate-655 font-sans">{skills.join(" • ")}</p>
        </div>
      )}
    </div>
  );

  // 5. Creative Template
  const renderCreative = () => (
    <div className={cn("flex h-full flex-col bg-white text-slate-700", fontClass, sizeClass, leadingClass)}>
      {/* Top Creative Accent Banner */}
      <div className="p-8 text-white" style={accentBgStyle}>
        <div className="flex items-center gap-6">
          {personalInfo.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={personalInfo.avatar}
              alt="Avatar"
              className="h-20 w-20 rounded-full border-4 border-white/20 object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight">
              {personalInfo.fullName || "Your Name"}
            </h1>
            <p className="mt-1 text-xs font-medium text-white/80">{personalInfo.title}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-white/60">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
            </div>
            {renderSocialProfiles()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 p-8">
        {/* Main */}
        <div className="col-span-2 space-y-6">
          {/* Summary */}
          {personalInfo.summary && (
            <div>
              <h3 className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wide" style={{ ...accentStyle, ...accentBorderStyle }}>
                My Story
              </h3>
              <div className="text-slate-600">{renderDescription(personalInfo.summary)}</div>
            </div>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <div>
              <h3 className="mb-3 border-b pb-1 text-xs font-bold uppercase tracking-wide" style={{ ...accentStyle, ...accentBorderStyle }}>
                Work Journey
              </h3>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-start justify-between font-bold text-slate-900">
                      <span>
                        {exp.role}{" "}
                        <span className="font-normal" style={accentStyle}>@ {exp.company}</span>
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <div className="mt-2 text-slate-600">{renderDescription(exp.description)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {renderProjectsSection()}
        </div>

        {/* Sidebar */}
        <div className="col-span-1 space-y-6">
          {/* Education */}
          {educations.length > 0 && (
            <div>
              <h3 className="mb-3 border-b pb-1 text-xs font-bold uppercase tracking-wide" style={{ ...accentStyle, ...accentBorderStyle }}>
                Education
              </h3>
              <div className="space-y-3">
                {educations.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <p className="font-bold text-slate-900">{edu.school}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{edu.degree}</p>
                    <p className="text-[9px] font-medium text-slate-400">
                      {edu.startDate} - {edu.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h3 className="mb-3 border-b border-violet-100 pb-1 text-xs font-bold uppercase tracking-wide text-violet-600">
                Skills Toolbox
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 text-[9px] font-medium text-violet-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 6. Corporate Template (Navy borders, clean dividers)
  const renderCorporate = () => (
    <div className={cn("h-full bg-white text-slate-800", paddingClass, fontClass, sizeClass, leadingClass)}>
      {/* Banner */}
      <div className="mb-6 border-l-4 pl-4" style={accentBorderStyle}>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-955" style={accentStyle}>
          {personalInfo.fullName || "Your Name"}
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider" style={accentStyle}>
          {personalInfo.title}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        {renderSocialProfiles()}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-5">
          <h3 className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider" style={{ ...accentStyle, ...accentBorderStyle }}>
            Professional Profile
          </h3>
          {renderDescription(personalInfo.summary)}
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3 border-b pb-1 text-xs font-bold uppercase tracking-wider" style={{ ...accentStyle, ...accentBorderStyle }}>
            Employment History
          </h3>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between font-bold text-slate-955">
                  <span>
                    {exp.role} <span className="font-normal text-slate-400">at</span> {exp.company}
                  </span>
                  <span className="text-[10px] font-normal text-slate-500">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="mt-1">{renderDescription(exp.description)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {renderProjectsSection()}

      {/* Education */}
      {educations.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3 border-b pb-1 text-xs font-bold uppercase tracking-wider" style={{ ...accentStyle, ...accentBorderStyle }}>
            Education Summary
          </h3>
          <div className="space-y-2">
            {educations.map((edu) => (
              <div key={edu.id} className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-950">{edu.school}</span>
                  <span className="mt-0.5 block text-[10px] text-slate-600">{edu.degree}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h3 className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider" style={{ ...accentStyle, ...accentBorderStyle }}>
            Technical Competencies
          </h3>
          <p className="text-slate-700">{skills.join(" • ")}</p>
        </div>
      )}
    </div>
  );

  // 7. Elegant Template (Soft typography, delicate separators)
  const renderElegant = () => (
    <div className={cn("h-full bg-amber-50/20 text-amber-955", paddingClass, fontClass, sizeClass, leadingClass)}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold italic tracking-wide text-slate-900" style={accentStyle}>
          {personalInfo.fullName || "Your Name"}
        </h1>
        <p className="mt-1 font-sans text-xs uppercase tracking-widest" style={accentStyle}>
          {personalInfo.title}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-sans text-[9px] text-amber-700/80">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        {renderSocialProfiles()}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-5">
          <h3 className="mb-2 border-b pb-1 text-center font-sans text-xs font-bold uppercase tracking-widest" style={{ ...accentStyle, ...accentBorderStyle }}>
            Executive Statement
          </h3>
          {renderDescription(personalInfo.summary)}
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3 border-b pb-1 text-center font-sans text-xs font-bold uppercase tracking-widest" style={{ ...accentStyle, ...accentBorderStyle }}>
            Career History
          </h3>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between font-bold text-slate-900">
                  <span>
                    {exp.role}{" "}
                    <span className="font-normal italic text-amber-800/80">— {exp.company}</span>
                  </span>
                  <span className="text-[10px] font-normal italic text-amber-700">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="text-slate-650 mt-1">{renderDescription(exp.description)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {renderProjectsSection()}

      {/* Education */}
      {educations.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3 border-b pb-1 text-center font-sans text-xs font-bold uppercase tracking-widest" style={{ ...accentStyle, ...accentBorderStyle }}>
            Education
          </h3>
          <div className="space-y-2">
            {educations.map((edu) => (
              <div key={edu.id} className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-900">{edu.school}</span>
                  <span className="text-amber-850 mt-0.5 block text-[10px]">{edu.degree}</span>
                </div>
                <span className="text-[10px] italic text-amber-700">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h3 className="mb-2 border-b pb-1 text-center font-sans text-xs font-bold uppercase tracking-widest" style={{ ...accentStyle, ...accentBorderStyle }}>
            Expertise Matrix
          </h3>
          <p className="text-slate-650 text-center font-sans">{skills.join(" • ")}</p>
        </div>
      )}
    </div>
  );

  // 8. Compact Template (Small font paddings for dense listings)
  const renderCompact = () => (
    <div className={cn("h-full bg-white text-slate-700", paddingClass, fontClass, sizeClass, leadingClass)}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between border-b pb-2" style={accentBorderStyle}>
        <div>
          <h1 className="text-base font-extrabold leading-none text-slate-955" style={accentStyle}>
            {personalInfo.fullName || "Your Name"}
          </h1>
          <p className="mt-1 text-xs font-medium leading-none text-slate-500">
            {personalInfo.title}
          </p>
        </div>
        <div className="space-y-0.5 text-right text-[9px] text-slate-400">
          {personalInfo.email && <p>{personalInfo.email}</p>}
          {personalInfo.phone && <p>{personalInfo.phone}</p>}
          {personalInfo.website && <p>{personalInfo.website}</p>}
        </div>
      </div>
      {renderSocialProfiles()}

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-3">{renderDescription(personalInfo.summary)}</div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-1.5 border-b pb-0.5 font-bold uppercase tracking-wide text-slate-955" style={{ ...accentStyle, ...accentBorderStyle }}>
            Experience
          </h3>
          <div className="space-y-2">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold text-slate-955">
                  <span>
                    {exp.role} ({exp.company})
                  </span>
                  <span className="font-normal text-slate-400 font-mono">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="mt-0.5">{renderDescription(exp.description)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {renderProjectsSection()}

      {/* Education */}
      {educations.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-1.5 border-b pb-0.5 font-bold uppercase tracking-wide text-slate-955" style={{ ...accentStyle, ...accentBorderStyle }}>
            Education
          </h3>
          <div className="space-y-1">
            {educations.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <span>
                  <span className="font-bold">{edu.school}</span> — {edu.degree}
                </span>
                <span className="text-slate-400 font-mono">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h3 className="mb-1 border-b pb-0.5 font-bold uppercase tracking-wide text-slate-955" style={{ ...accentStyle, ...accentBorderStyle }}>
            Skills
          </h3>
          <p className="text-slate-655">{skills.join(" • ")}</p>
        </div>
      )}
    </div>
  );

  // 9. Student Template (Emphasizes education first)
  const renderStudent = () => (
    <div className={cn("h-full bg-white text-slate-800", paddingClass, fontClass, sizeClass, leadingClass)}>
      {/* Header */}
      <div className="mb-4 border-b pb-4" style={accentBorderStyle}>
        <h1 className="text-xl font-bold tracking-tight text-slate-955" style={accentStyle}>
          {personalInfo.fullName || "Your Name"}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{personalInfo.title || "Student"}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        {renderSocialProfiles()}
      </div>

      {/* Education First */}
      {educations.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2.5 border-b pb-1 text-xs font-bold uppercase tracking-wider text-slate-900" style={{ ...accentStyle, ...accentBorderStyle }}>
            Education
          </h3>
          <div className="space-y-3">
            {educations.map((edu) => (
              <div key={edu.id} className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-950">{edu.school}</span>
                  <span className="mt-0.5 block text-[10px] text-slate-600">{edu.degree}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2.5 border-b pb-1 text-xs font-bold uppercase tracking-wider text-slate-900" style={{ ...accentStyle, ...accentBorderStyle }}>
            Technical Skills & Courses
          </h3>
          <p className="text-slate-700">{skills.join(" • ")}</p>
        </div>
      )}

      {/* Projects */}
      {renderProjectsSection("student")}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3 border-b pb-1 text-xs font-bold uppercase tracking-wider text-slate-900" style={{ ...accentStyle, ...accentBorderStyle }}>
            Work Experience
          </h3>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between font-bold text-slate-950">
                  <span>
                    {exp.role} — {exp.company}
                  </span>
                  <span className="text-[10px] font-normal text-slate-500">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="mt-1">{renderDescription(exp.description)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 10. Developer Template (Highlights skills and tech prominently)
  const renderDeveloper = () => (
    <div className={cn("h-full bg-slate-950 font-mono text-[10px] leading-relaxed", paddingClass, fontClass, sizeClass, leadingClass)} style={accentStyle}>
      {/* Terminal Header */}
      <div className="mb-4 border-b pb-4 text-emerald-450" style={accentBorderStyle}>
        <h1 className="text-lg font-bold tracking-tight">
          &gt;_ {personalInfo.fullName || "Your Name"}
        </h1>
        <p className="mt-1 text-xs font-semibold">
          &gt; {personalInfo.title || "Full Stack Developer"}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 opacity-80">
          {personalInfo.email && <span>email: {personalInfo.email}</span>}
          {personalInfo.phone && <span>tel: {personalInfo.phone}</span>}
          {personalInfo.website && <span>url: {personalInfo.website}</span>}
        </div>
        {renderSocialProfiles()}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-4 text-slate-300">
          <h3 className="mb-2 border-b pb-0.5 text-xs font-bold uppercase tracking-wider text-emerald-450" style={accentBorderStyle}>
            [0] Summary
          </h3>
          {renderDescription(personalInfo.summary)}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4 text-emerald-400">
          <h3 className="mb-2 border-b pb-0.5 text-xs font-bold uppercase tracking-wider text-emerald-450" style={accentBorderStyle}>
            [1] Tech Stack
          </h3>
          <p className="font-semibold">{skills.join(" // ")}</p>
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-4 text-slate-300">
          <h3 className="mb-3 border-b pb-0.5 text-xs font-bold uppercase tracking-wider text-emerald-450" style={accentBorderStyle}>
            [2] Experience
          </h3>
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between font-bold text-slate-200">
                  <span className="opacity-90 font-semibold">
                    {exp.role} @ {exp.company}
                  </span>
                  <span className="opacity-70 text-[9px]">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="mt-1">{renderDescription(exp.description)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {renderProjectsSection("dark")}

      {/* Education */}
      {educations.length > 0 && (
        <div className="text-slate-300">
          <h3 className="mb-2.5 border-b pb-0.5 text-xs font-bold uppercase tracking-wider text-emerald-450" style={accentBorderStyle}>
            [4] Education
          </h3>
          <div className="space-y-1">
            {educations.map((edu) => (
              <div key={edu.id} className="flex justify-between text-slate-200">
                <span>
                  {edu.school} -- {edu.degree}
                </span>
                <span className="opacity-70 font-mono text-[9px]">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "aspect-[1/1.4] w-full overflow-hidden rounded-xl border bg-white shadow-md select-none",
        className
      )}
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
});
