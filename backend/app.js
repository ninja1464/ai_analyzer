import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import resumeRoutes from "./routes/resumeRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import applicantProfileRoutes from "./routes/applicantProfileRoutes.js";
import autoApplyRoutes from "./routes/autoApplyRoutes.js";


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many attempts, please try again later" },
});

const app = express();

app.use((req, res, next) => {
  console.log("REQUEST", req.method, req.url);
  next();
});
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
app.use(cors({ origin: allowedOrigins, optionsSuccessStatus: 200 }));
app.use(express.json());

app.use("/api/resume", resumeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", authLimiter, userRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/profile", applicantProfileRoutes);
app.use("/api/apply", autoApplyRoutes);

app.get("/", (req, res) => {
  console.log("ROOT ROUTE HIT");
  res.status(200).send("Backend working");
});

export default app;
