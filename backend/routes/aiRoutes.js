import express from "express";
import { skillGap, rewrite, interview, roadmap, chat } from "../controllers/aiController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/skillgap",  optionalAuth, skillGap);
router.post("/rewrite",   optionalAuth, rewrite);
router.post("/interview", optionalAuth, interview);
router.post("/roadmap",   optionalAuth, roadmap);
router.post("/chat",      optionalAuth, chat);

export default router;
