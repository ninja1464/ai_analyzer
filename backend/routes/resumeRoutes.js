import express from "express";
import multer from "multer";
import path from "path";

import {
  uploadResume,
  getResumeHistory,
  generateResume,
} from "../controllers/resumeController.js";
import { matchResume } from "../controllers/jobMatchController.js";
import { authenticate, optionalAuth } from "../middleware/authMiddleware.js";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTS = [".pdf", ".doc", ".docx"];

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_TYPES.includes(file.mimetype) && ALLOWED_EXTS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
});

function handleUpload(req, res, next) {
  upload.single("resume")(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, error: "File must be under 5 MB" });
    }
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}

const router = express.Router();

router.post("/upload", optionalAuth, handleUpload, uploadResume);
router.post("/match", matchResume);
router.get("/history", authenticate, getResumeHistory);
router.post("/generate", optionalAuth, generateResume);

export default router;
