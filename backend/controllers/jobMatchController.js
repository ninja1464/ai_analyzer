import { matchResumeToJob } from "../services/jobMatchService.js";

export const matchResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "resumeText and jobDescription are required",
      });
    }

    const result = await matchResumeToJob(resumeText, jobDescription);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("MATCH CONTROLLER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
