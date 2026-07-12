import { computeAtsScore } from "../services/atsScoreService.js";

export const matchResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "resumeText and jobDescription are required",
      });
    }

    const score = await computeAtsScore(resumeText, jobDescription);

    return res.status(200).json({
      success: true,
      data: {
        matchScore: score.overall,
        keywordScore: score.keywordScore,
        structureScore: score.structureScore,
        llmScore: score.llmScore,
        missingKeywords: score.missingKeywords,
        matchedKeywords: score.matchedKeywords,
        formatWarnings: score.formatWarnings,
        fitAnalysis: score.fitAnalysis,
        improvementSuggestions: score.improvementSuggestions,
      },
    });
  } catch (error) {
    console.error("MATCH CONTROLLER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
