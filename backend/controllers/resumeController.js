import fs from "fs";
import { randomUUID } from "crypto";
import { parseResume } from "../services/parserService.js";
import { analyzeResume, generateTailoredResume } from "../services/aiService.js";
import { findMany, insertOne } from "../db.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const text = await parseResume(req.file.path);
    const analysis = await analyzeResume(text);

    fs.unlink(req.file.path, () => {});

    if (!analysis.success) {
      return res.status(500).json({
        success: false,
        error: analysis.error,
      });
    }

    if (req.user) {
      const record = {
        id: randomUUID(),
        userId: req.user.id,
        title: req.file.originalname || "Resume upload",
        uploadedAt: new Date().toISOString(),
        summary: analysis.data?.summary || "Resume analyzed",
        score: analysis.data?.score ?? analysis.data?.atsScore ?? null,
        resumeText: text.slice(0, 2000),
      };
      await insertOne("resumeHistory", record);
    }

    return res.status(200).json({
      success: true,
      message: "Analysis complete",
      data: analysis.data,
      resumeText: text,
    });
  } catch (error) {
    console.error("CONTROLLER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getResumeHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const userHistory = await findMany("resumeHistory", { userId });

    return res.status(200).json({ success: true, data: userHistory });
  } catch (error) {
    console.error("RESUME HISTORY ERROR:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const generateResume = async (req, res) => {
  try {
    const { resumeText, jobDescription, matchData } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "resumeText and jobDescription are required",
      });
    }

    const result = await generateTailoredResume(resumeText, jobDescription, matchData);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    return res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    console.error("GENERATE CONTROLLER ERROR:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
