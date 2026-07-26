export const siteConfig = {
  name: "AI Resume Builder Pro",
  description:
    "Create professional, ATS-optimized, and visually stunning resumes in minutes with the power of AI.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://ai-resume-builder-pro.vercel.app",
  ogImage: "https://ai-resume-builder-pro.vercel.app/og.png",
  links: {
    twitter: "https://twitter.com/airesumebuilder",
    github: "https://github.com/airesumebuilder/pro",
  },
  keywords: [
    "AI Resume Builder",
    "ATS Optimized Resume",
    "Resume Creator",
    "Professional Resume",
    "CV Builder",
    "Career Tool",
    "Next.js Resume Builder",
  ],
  author: "AI Resume Builder Pro Team",
};

export type SiteConfig = typeof siteConfig;
