import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
