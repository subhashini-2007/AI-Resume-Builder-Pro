export const siteConfig = {
  name: "AI Resume Builder Pro",
  description:
    "AI-powered Resume Builder, ATS Checker, Cover Letter Generator and Career Assistant.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://ai-resume-builder-pro.vercel.app",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/airesumebuilder",
    github: "https://github.com/subhashini-2007/AI-Resume-Builder-Pro",
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
