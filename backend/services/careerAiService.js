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
const MODEL = process.env.AI_MODEL || "llama-3.3-70b-versatile";

async function callAI(prompt) {
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
  });
  return res.choices[0].message.content.trim();
}

function parseJSON(raw) {
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

export const analyzeSkillGap = async (resumeText, targetRole) => {
  try {
    const raw = await callAI(`
You are a career advisor.
Analyze the skill gap for this resume targeting: ${targetRole || "Software Engineer"}.

Return ONLY valid JSON (no extra text):
{
  "currentSkills": [string],
  "targetRole": string,
  "missingSkills": [{ "skill": string, "priority": "High" | "Medium" | "Low", "reason": string }],
  "summary": string
}

Generate 4-6 missing skills with concise reasons. Be specific to the resume.

Resume:
${resumeText.slice(0, 3000)}
`);
    return { success: true, data: parseJSON(raw) };
  } catch (e) {
    console.error("SKILL GAP ERROR:", e);
    return { success: false, error: e.message };
  }
};

export const rewriteBullet = async (bulletPoint, resumeText) => {
  try {
    const raw = await callAI(`
You are an expert resume writer.
Rewrite this resume bullet point to be stronger, using action verbs and quantifiable results where possible.

Return ONLY valid JSON (no extra text):
{
  "original": string,
  "suggestions": [string, string, string]
}

Provide exactly 3 improved versions. Each under 20 words. Start each with a strong past-tense action verb.

Bullet point: "${bulletPoint}"
Resume context: ${(resumeText || "").slice(0, 800)}
`);
    return { success: true, data: parseJSON(raw) };
  } catch (e) {
    console.error("REWRITE ERROR:", e);
    return { success: false, error: e.message };
  }
};

export const generateInterviewQuestions = async (resumeText, jobRole) => {
  try {
    const raw = await callAI(`
Generate personalized interview questions for this candidate applying for: ${jobRole || "Software Engineer"}.
Base questions on their actual resume experience.

Return ONLY valid JSON (no extra text):
{
  "Technical": [{ "question": string, "answer": string }],
  "Behavioral": [{ "question": string, "answer": string }],
  "SystemDesign": [{ "question": string, "answer": string }]
}

Exactly 3 questions per category. Answers should be 2-3 sentences tailored to this candidate.

Resume:
${resumeText.slice(0, 2500)}
`);
    return { success: true, data: parseJSON(raw) };
  } catch (e) {
    console.error("INTERVIEW ERROR:", e);
    return { success: false, error: e.message };
  }
};

export const generateCareerRoadmap = async (resumeText, targetRole) => {
  try {
    const raw = await callAI(`
Generate a personalized 6-month career roadmap for this candidate.
Target role: ${targetRole || "Senior Software Engineer"}

Return ONLY valid JSON (no extra text):
{
  "currentLevel": string,
  "targetRole": string,
  "milestones": [
    { "period": string, "title": string, "items": [string] }
  ],
  "summary": string
}

Generate exactly 4 milestones (e.g. "Month 1-2", "Month 3", "Month 4-5", "Month 6").
Each milestone has 3-4 specific, actionable items based on the resume gaps.

Resume:
${resumeText.slice(0, 2500)}
`);
    return { success: true, data: parseJSON(raw) };
  } catch (e) {
    console.error("ROADMAP ERROR:", e);
    return { success: false, error: e.message };
  }
};

export const chatWithAI = async (message, resumeText) => {
  try {
    const raw = await callAI(`
You are a career advisor specializing in tech hiring, resume optimization, and job search strategy.
${resumeText ? "You have access to the user's resume below. Reference it when relevant." : ""}

Question: ${message}

${resumeText ? `Resume context:
${resumeText.slice(0, 2000)}` : ""}

Answer helpfully and concisely. 2-4 short paragraphs max. Use plain text, no markdown.
`);
    return { success: true, data: { reply: raw } };
  } catch (e) {
    console.error("CHAT ERROR:", e);
    return { success: false, error: e.message };
  }
};
