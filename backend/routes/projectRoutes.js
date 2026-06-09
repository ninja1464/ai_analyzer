import express from "express";
import {
  createProject,
  listProjects,
} from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.post("/", createProject);
router.get("/", listProjects);

export default router;
