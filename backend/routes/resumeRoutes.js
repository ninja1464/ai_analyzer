import express from "express";
import multer from "multer";

import {
  uploadResume,
  getResumeHistory,
} from "../controllers/resumeController.js";
import { matchResume } from "../controllers/jobMatchController.js";
import { authenticate, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", optionalAuth, upload.single("resume"), uploadResume);
router.post("/match", matchResume);
router.get("/history", authenticate, getResumeHistory);

export default router;
