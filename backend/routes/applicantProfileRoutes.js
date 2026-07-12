import express from "express";
import {
  getApplicantProfile,
  updateApplicantProfile,
} from "../controllers/applicantProfileController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/", getApplicantProfile);
router.put("/", updateApplicantProfile);

export default router;
