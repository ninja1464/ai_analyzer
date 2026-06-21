import {
  analyzeSkillGap,
  rewriteBullet,
  generateInterviewQuestions,
  generateCareerRoadmap,
  chatWithAI,
} from "../services/careerAiService.js";

async function handle(res, fn) {
  try {
    const result = await fn();
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
    return res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    console.error("AI CONTROLLER ERROR:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export const skillGap = (req, res) => {
  const { resumeText, targetRole } = req.body;
  if (!resumeText) return res.status(400).json({ success: false, error: "resumeText is required" });
  return handle(res, () => analyzeSkillGap(resumeText, targetRole));
};

export const rewrite = (req, res) => {
  const { bulletPoint, resumeText } = req.body;
  if (!bulletPoint) return res.status(400).json({ success: false, error: "bulletPoint is required" });
  return handle(res, () => rewriteBullet(bulletPoint, resumeText));
};

export const interview = (req, res) => {
  const { resumeText, jobRole } = req.body;
  if (!resumeText) return res.status(400).json({ success: false, error: "resumeText is required" });
  return handle(res, () => generateInterviewQuestions(resumeText, jobRole));
};

export const roadmap = (req, res) => {
  const { resumeText, targetRole } = req.body;
  if (!resumeText) return res.status(400).json({ success: false, error: "resumeText is required" });
  return handle(res, () => generateCareerRoadmap(resumeText, targetRole));
};

export const chat = (req, res) => {
  const { message, resumeText } = req.body;
  if (!message) return res.status(400).json({ success: false, error: "message is required" });
  return handle(res, () => chatWithAI(message, resumeText));
};
