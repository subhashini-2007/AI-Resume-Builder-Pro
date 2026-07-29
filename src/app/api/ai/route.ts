import { NextRequest } from "next/server";
import { handleApiError, handleApiSuccess, getSessionUser } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

// 15-minute in-memory cache for duplicate AI tasks/prompts
const aiCache = new Map<string, { responseText: string; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    const { task, payload } = await request.json();

    if (!task || !payload) {
      throw new Error("Missing task or payload parameters.");
    }

    // Check cache for identical user request
    const cacheKey = `${userId}:${task}:${JSON.stringify(payload)}`;
    const cached = aiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      try {
        const parsed = JSON.parse(
          cached.responseText
            .trim()
            .replace(/```json/g, "")
            .replace(/```/g, "")
        );
        return handleApiSuccess(parsed);
      } catch {
        return handleApiSuccess(cached.responseText);
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isMock = !apiKey || apiKey === "placeholder_gemini_api_key";

    let responseText = "";

    if (task === "cover-letter") {
      const { jobTitle, company } = payload;
      if (isMock) {
        responseText = `Dear Hiring Team at ${company},\n\nI am writing to express my enthusiastic interest in the ${jobTitle} position. With over 5 years of experience developing responsive web applications using Next.js, React, and TypeScript, I am confident in my ability to contribute value to your development team immediately.\n\nThroughout my career, I have focused on building performant interfaces that improve user experience. In my previous role, I led the migration of main product pages to Next.js, resulting in a 35% speed improvement. I look forward to bringing this same dedication to ${company}.\n\nThank you for your time and consideration.\n\nSincerely,\nJob Seeker`;
      } else {
        responseText = await callGemini(
          `Write a professional cover letter for a ${jobTitle} position at ${company}. Keep it under 300 words. Return only the plain cover letter text.`
        );
      }

      // Save to CoverLetter table
      await prisma.coverLetter.create({
        data: {
          userId,
          jobTitle,
          company,
          body: responseText,
        },
      });
    } else if (task === "ai-generate") {
      const { prompt, actionType, writingStyle, experienceLevel, resumeId } = payload;
      
      let contextString = "";
      if (resumeId) {
        const resume = await prisma.resume.findUnique({
          where: { id: resumeId },
          include: {
            experiences: { orderBy: { order: "asc" } },
            educations: { orderBy: { order: "asc" } },
            skills: { orderBy: { order: "asc" } },
            projects: { orderBy: { order: "asc" } },
          },
        });
        if (resume) {
          contextString = `
User's Resume Context:
- Full Name: ${resume.fullName || ""}
- Title: ${resume.title || ""}
- Summary: ${resume.summary || ""}
- Skills: ${(resume.skills || []).map((s: any) => s.name).join(", ")}
- Experiences: ${(resume.experiences || []).map((e: any) => `${e.role} at ${e.company} (${e.startDate} - ${e.endDate}): ${e.description}`).join(" | ")}
- Projects: ${(resume.projects || []).map((p: any) => `${p.name} (${p.projectType}): ${p.description}. Tech: ${p.technologies || ""}`).join(" | ")}
`;
        }
      }

      const promptTemplate = `
You are an elite, professional resume writer and ATS optimization expert.
Your task is to perform the following action: "${actionType}"
User's Input Prompt: "${prompt}"
Target Experience Level: "${experienceLevel || "Mid Level"}"
Target Writing Style: "${writingStyle || "Professional"}"
${contextString ? contextString : ""}

IMPORTANT COMPLIANCE INSTRUCTIONS:
1. Do NOT invent new companies, employment dates, years of experience, specific metric numbers, projects, certifications, or awards. Any information output must be strictly grounded in the user's prompt or context.
2. Optimize and polish existing text for grammar, structure, tone, impact, and ATS keywords while remaining strictly faithful to the factual details.
3. Output the result in clean, well-formatted markdown. Do not wrap in extra conversational text; return only the suggestions or optimized content.
`;

      if (isMock) {
        responseText = `### Factual AI Suggestion (${writingStyle} / ${experienceLevel})\n\nBased on your request "${prompt}" and provided context:\n\n*   **Optimized Phrasing**: *"Designed and deployed full-stack web architectures utilizing modern frameworks, improving load responsiveness and code structure."*\n*   **Recommended ATS Keywords**: *web architecture, front-end optimization, full-stack development*`;
      } else {
        responseText = await callGemini(promptTemplate);
      }
    } else if (task === "ats-scan") {
      const { jobTitle, resumeContent } = payload;
      if (isMock) {
        responseText = JSON.stringify({
          score: 84,
          keywordsMatched: ["React 19", "TypeScript", "Tailwind CSS", "REST APIs"],
          keywordsMissing: ["GraphQL", "Next.js App Router", "CI/CD Pipeline"],
          layoutIssues: ["No major styling layout errors found. Columns parse clean."],
        });
      } else {
        responseText = await callGemini(
          `Analyze the following resume text against the target job title '${jobTitle}'. Return ONLY a JSON object with this exact structure: { "score": number, "keywordsMatched": string[], "keywordsMissing": string[], "layoutIssues": string[] }. Do not include markdown wraps. Resume text: ${resumeContent}`
        );
      }

      // Parse score from response to save to ATSReport table
      let scoreVal = 80;
      try {
        const json = JSON.parse(
          responseText
            .trim()
            .replace(/```json/g, "")
            .replace(/```/g, "")
        );
        scoreVal = json.score || 80;
      } catch {
        // fallback if Gemini returned non-JSON
      }

      await prisma.aTSReport.create({
        data: {
          resumeId: payload.resumeId || undefined,
          jobTitle,
          score: scoreVal,
          details: responseText,
        },
      });
    } else if (task === "interview-feedback") {
      const { questionTitle, questionType, answer } = payload;
      if (isMock) {
        let score = 82;
        let strengths = "Your answer demonstrates standard terminology and structures.";
        let improvements = "Be more specific with key architectural details and metrics.";

        if (payload.questionId === "q1") {
          score = 86;
          strengths =
            "Excellent execution of the STAR methodology. You clearly defined the context, action, and resulting positive metrics.";
          improvements =
            "Describe the specific debug logs or monitoring tools (e.g. Sentry, Datadog) used to speed up resolution.";
        } else if (payload.questionId === "q2") {
          score = 78;
          strengths = "Good grasp of hydration differences and cache tag invalidation details.";
          improvements =
            "Add details regarding Next.js 15 request memoization and fetch Cache control headers.";
        } else if (payload.questionId === "q3") {
          score = 90;
          strengths = "Shows strong team alignment, culture fit, and motivation.";
          improvements =
            "Reference specific tech stack targets (like Next.js 15 migration priorities) to prove technology interest.";
        }

        responseText = JSON.stringify({ score, strengths, improvements });
      } else {
        responseText = await callGemini(
          `Evaluate the following user response to the interview question: '${questionTitle}' (Type: '${questionType}'). User's response: '${answer}'. Return ONLY a JSON object with this structure: { "score": number, "strengths": string, "improvements": string }. Do not include markdown wraps.`
        );
      }
    } else {
      throw new Error(`Unsupported AI task: ${task}`);
    }

    // Populate cache for identical future requests
    aiCache.set(cacheKey, { responseText, timestamp: Date.now() });

    // Save to AIHistory table
    await prisma.aIHistory.create({
      data: {
        userId,
        actionType: task,
        prompt: JSON.stringify(payload),
        response: responseText,
      },
    });

    // If response was JSON string, parse it before returning
    try {
      const parsed = JSON.parse(
        responseText
          .trim()
          .replace(/```json/g, "")
          .replace(/```/g, "")
      );
      return handleApiSuccess(parsed);
    } catch {
      return handleApiSuccess(responseText);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Invalid response structure from Gemini API.");
  }

  return text;
}
