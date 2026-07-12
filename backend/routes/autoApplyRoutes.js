import express from "express";
import {
  prepare,
  submit,
  confirmManual,
  searchJobsHandler,
  list,
  getOne,
  getScreenshot,
  getConfirmationScreenshot,
} from "../controllers/autoApplyController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/search-jobs", searchJobsHandler);
router.post("/prepare", prepare);
router.post("/:id/submit", submit);
router.post("/:id/confirm-manual", confirmManual);
router.get("/", list);
router.get("/:id", getOne);
router.get("/:id/screenshot", getScreenshot);
router.get("/:id/confirmation-screenshot", getConfirmationScreenshot);

export default router;
