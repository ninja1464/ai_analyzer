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

export const getApplicantProfile = () => API.get("/profile");

export const updateApplicantProfile = (profileData) =>
  API.put("/profile", profileData);

export const prepareApplication = (jobUrl, resumeText) =>
  API.post("/apply/prepare", { jobUrl, resumeText });

export const submitApplication = (applicationId) =>
  API.post(`/apply/${applicationId}/submit`);

export const confirmManualSubmission = (applicationId) =>
  API.post(`/apply/${applicationId}/confirm-manual`);

export const searchJobs = (keywords, location) =>
  API.get("/apply/search-jobs", { params: { keywords, location } });

export const listApplications = () => API.get("/apply");

export const getApplication = (applicationId) => API.get(`/apply/${applicationId}`);

// Screenshot endpoints require auth headers, so <img src> can't hit them
// directly — fetch as a blob and turn it into an object URL instead.
export const getApplicationScreenshotBlob = (applicationId) =>
  API.get(`/apply/${applicationId}/screenshot`, { responseType: "blob" });

export const getApplicationConfirmationScreenshotBlob = (applicationId) =>
  API.get(`/apply/${applicationId}/confirmation-screenshot`, { responseType: "blob" });
