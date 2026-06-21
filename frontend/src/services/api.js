import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }
};

export const uploadResume = (formData) => API.post("/resume/upload", formData);

export const matchResume = (resumeText, jobDescription) =>
  API.post("/resume/match", { resumeText, jobDescription });

export const createProject = (projectData) =>
  API.post("/projects", projectData);

export const listProjects = () => API.get("/projects");

export const createUser = (userData) => API.post("/users", userData);

export const loginUser = (credentials) => API.post("/auth/login", credentials);

export const getCurrentUser = () => API.get("/auth/me");

export const getResumeHistory = () => API.get("/resume/history");

export const generateResume = (resumeText, jobDescription, matchData) =>
  API.post("/resume/generate", { resumeText, jobDescription, matchData });

export const analyzeSkillGap = (resumeText, targetRole) =>
  API.post("/ai/skillgap", { resumeText, targetRole });

export const rewriteBullet = (bulletPoint, resumeText) =>
  API.post("/ai/rewrite", { bulletPoint, resumeText });

export const generateInterviewQuestions = (resumeText, jobRole) =>
  API.post("/ai/interview", { resumeText, jobRole });

export const generateCareerRoadmap = (resumeText, targetRole) =>
  API.post("/ai/roadmap", { resumeText, targetRole });

export const chatWithAI = (message, resumeText) =>
  API.post("/ai/chat", { message, resumeText });
