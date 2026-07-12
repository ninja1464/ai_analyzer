import fs from "fs";
import {
  prepareApplication,
  submitApplication,
  confirmManualSubmission,
  listApplications,
  getApplication,
} from "../services/autoApplyService.js";
import { searchJobs } from "../services/jobSearchService.js";

function errorStatus(error) {
  if (error.code === "DUPLICATE_APPLICATION") return 409;
  if (error.code === "NOT_FOUND") return 404;
  if (error.code === "INVALID_STATE") return 409;
  return 500;
}

export const prepare = async (req, res) => {
  try {
    const { jobUrl, resumeText } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    if (!jobUrl || !resumeText) {
      return res.status(400).json({
        success: false,
        error: "jobUrl and resumeText are required",
      });
    }

    const application = await prepareApplication({ userId, jobUrl, resumeText });
    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("AUTO APPLY PREPARE ERROR:", error);
    return res
      .status(errorStatus(error))
      .json({ success: false, error: error.message || "Failed to prepare application" });
  }
};

export const submit = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const application = await submitApplication({ userId, applicationId: id });
    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("AUTO APPLY SUBMIT ERROR:", error);
    return res
      .status(errorStatus(error))
      .json({ success: false, error: error.message || "Failed to submit application" });
  }
};

export const confirmManual = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const application = await confirmManualSubmission({ userId, applicationId: id });
    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("AUTO APPLY CONFIRM MANUAL ERROR:", error);
    return res
      .status(errorStatus(error))
      .json({ success: false, error: error.message || "Failed to confirm submission" });
  }
};

export const searchJobsHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { keywords, location } = req.query;
    if (!keywords) {
      return res.status(400).json({ success: false, error: "keywords query param is required" });
    }

    const results = await searchJobs({ keywords, location });
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("JOB SEARCH ERROR:", error);
    return res.status(500).json({ success: false, error: error.message || "Job search failed" });
  }
};

export const list = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const applications = await listApplications(userId);
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error("AUTO APPLY LIST ERROR:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getOne = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const application = await getApplication(userId, id);
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }
    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("AUTO APPLY GET ERROR:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

async function streamImage(req, res, pathField) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const application = await getApplication(userId, id);
    const filePath = application?.[pathField];
    if (!application || !filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: "Image not found" });
    }

    res.setHeader("Content-Type", "image/png");
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("AUTO APPLY IMAGE ERROR:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export const getScreenshot = (req, res) => streamImage(req, res, "screenshotPath");
export const getConfirmationScreenshot = (req, res) =>
  streamImage(req, res, "confirmationScreenshotPath");
