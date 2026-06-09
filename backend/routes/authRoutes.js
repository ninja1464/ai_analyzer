import express from "express";
import { loginUser, getCurrentUser } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", authenticate, getCurrentUser);

export default router;
