import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const matchResumeToJob = async (resumeText, jobDescription) => {
  try {
    const prompt = `
You are an ATS system.

Compare the resume with the job description.

Return ONLY JSON:

{
  "matchScore": number,
  "missingKeywords": [string],
  "fitAnalysis": string,
  "improvementSuggestions": [string]
}

Rules:
- matchScore MUST be an integer from 0 to 100 (a percentage), never a 0-1 fraction

Job Description:
${jobDescription}

Resume:
${resumeText.slice(0, 3000)}
`;

    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, "").trim();

    return {
      success: true,
      data: JSON.parse(cleaned),
    };
  } catch (error) {
    console.error("MATCH ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};
