import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const analyzeResume = async (text) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not set");
  }

  try {
    const trimmedText = text.slice(0, 4000); // prevent token overflow

    const prompt = `
You are a strict ATS (Applicant Tracking System).

Evaluate the resume realistically.

Rules:
- Score must be between 0 and 100
- 50 = average resume
- 70+ = strong resume
- 80+ = very strong resume

Return ONLY JSON:

{
  "score": number,
  "skillsFound": [string],
  "experienceYears": number,
  "recommendedRoles": [string],
  "missingSkills": [string],
  "improvements": [string],
  "strengths": [string]
}

Be accurate and avoid extreme low scores unless the resume is very poor.

Resume:
${trimmedText}
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.choices[0].message.content;

    // clean JSON
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    console.error("GROQ ERROR:", error);

    return {
      success: false,
      error: error.message || "AI analysis failed",
    };
  }
};

export const generateTailoredResume = async (resumeText, jobDescription, matchData) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not set");
  }

  try {
    const missingKeywords = matchData?.missingKeywords?.join(", ") || "none";
    const suggestions = matchData?.improvementSuggestions?.join("\n- ") || "none";

    const prompt = `
You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist.

Rewrite the candidate's resume to score as high as possible against the job description below,
while fitting on exactly ONE printed page.

Rules:
- Mirror the job description's own terminology and phrasing wherever the candidate genuinely has
  that skill/experience — ATS keyword matchers score exact-phrase overlap, not synonyms
  (e.g. if the JD says "REST API integrations", use that exact phrase rather than "API work").
- Incorporate these missing keywords naturally, and only where truthfully applicable: ${missingKeywords}
- Apply these improvement suggestions:
  - ${suggestions}
- Reframe existing experience using strong action verbs aligned with the job's responsibilities.
- Do NOT invent skills, tools, employers, or experience the candidate does not have.
- ONE PAGE BUDGET: target 380-480 words total. To hit this:
  - Keep the Professional Summary to 2-3 lines.
  - Cut or shorten bullet points and projects that are least relevant to THIS job; keep the
    2-3 most relevant experience/project entries and compress the rest to one line each or omit.
  - Prefer dense, specific bullets (metric or outcome first) over generic ones.
- Keep the same section structure (Summary, Skills, Experience/Projects, Education, etc.) and
  the same ALL-CAPS section heading style as the original, so it renders cleanly as plain text.
- Return ONLY the rewritten resume as plain text, no commentary, no markdown.

Job Description:
${jobDescription.slice(0, 3000)}

Original Resume:
${resumeText.slice(0, 4000)}
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const generated = response.choices[0].message.content.trim();

    return { success: true, data: { generatedResume: generated } };
  } catch (error) {
    console.error("GENERATE RESUME ERROR:", error);
    return { success: false, error: error.message || "Resume generation failed" };
  }
};

export const generateCoverLetter = async (resumeText, jobDescription, companyName, applicantName) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not set");
  }

  try {
    const prompt = `
You are an expert cover letter writer.

Write a concise, specific cover letter (under 300 words) for the candidate below, applying to ${companyName || "this company"}.

Rules:
- Address genuine, specific points from the job description — no generic filler
- Reference real skills/experience from the resume, do not invent anything
- Professional but not stiff tone
- Sign off with the candidate's name: ${applicantName || "the candidate"}
- Return ONLY the cover letter text, no commentary, no markdown

Job Description:
${jobDescription.slice(0, 2000)}

Resume:
${resumeText.slice(0, 3000)}
`;

    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const generated = response.choices[0].message.content.trim();

    return { success: true, data: { coverLetter: generated } };
  } catch (error) {
    console.error("GENERATE COVER LETTER ERROR:", error);
    return { success: false, error: error.message || "Cover letter generation failed" };
  }
};
