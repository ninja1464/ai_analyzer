import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  uploadResume,
  setAuthToken,
  listProjects,
  getResumeHistory,
  getCurrentUser,
} from "../services/api";
import DashboardPage from "./DashboardPage";
import ResumeAnalysisPage from "./ResumeAnalysisPage";
import JobMatchPage from "./JobMatchPage";
import ResumeHistoryPage from "./ResumeHistoryPage";
import ProjectsPage from "./ProjectsPage";
import SkillGapPage from "./SkillGapPage";
import ResumeRewriterPage from "./ResumeRewriterPage";
import InterviewQuestionsPage from "./InterviewQuestionsPage";
import CareerRoadmapPage from "./CareerRoadmapPage";
import AIChatPage from "./AIChatPage";
import SettingsPage from "./SettingsPage";
import SignUpPage from "./SignUpPage";
import LoginPage from "./LoginPage";

const publicPages = ["Login", "Sign Up"];
const privatePages = [
  "Dashboard",
  "Resume Analysis",
  "Job Match",
  "Resume History",
  "Projects",
  "Skill Gap",
  "Resume Rewriter",
  "Interview Questions",
  "Career Roadmap",
  "AI Chat",
  "Settings",
];

const pageMap = {
  Dashboard: DashboardPage,
  "Resume Analysis": ResumeAnalysisPage,
  "Job Match": JobMatchPage,
  "Resume History": ResumeHistoryPage,
  Projects: ProjectsPage,
  "Sign Up": SignUpPage,
  Login: LoginPage,
  "Skill Gap": SkillGapPage,
  "Resume Rewriter": ResumeRewriterPage,
  "Interview Questions": InterviewQuestionsPage,
  "Career Roadmap": CareerRoadmapPage,
  "AI Chat": AIChatPage,
  Settings: SettingsPage,
};

const Home = () => {
  const [selectedPage, setSelectedPage] = useState("Login");
  const [resumeData, setResumeData] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [resumeHistory, setResumeHistory] = useState([]);

  const isAuthenticated = Boolean(user);
  const allowedPages = isAuthenticated ? privatePages : publicPages;
  const Page = pageMap[selectedPage] || DashboardPage;

  useEffect(() => {
    const savedToken = localStorage.getItem("resumeAI_token");
    const savedUser = localStorage.getItem("resumeAI_user");

    if (savedToken) {
      setAuthToken(savedToken);
      verifyCurrentUser(savedUser);
    }
  }, []);

  const verifyCurrentUser = async (savedUser) => {
    try {
      const response = await getCurrentUser();
      if (response?.data?.success) {
        const currentUser = response.data.data;
        setUser(currentUser);
        localStorage.setItem("resumeAI_user", JSON.stringify(currentUser));
        setSelectedPage("Dashboard");
        await loadUserContent();
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error("Token validation failed", error);
      clearAuth();
    }
  };

  useEffect(() => {
    if (!allowedPages.includes(selectedPage)) {
      setSelectedPage(isAuthenticated ? "Dashboard" : "Login");
    }
  }, [selectedPage, allowedPages, isAuthenticated]);

  const persistAuth = (token, userData) => {
    localStorage.setItem("resumeAI_token", token);
    localStorage.setItem("resumeAI_user", JSON.stringify(userData));
    setAuthToken(token);
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem("resumeAI_token");
    localStorage.removeItem("resumeAI_user");
    setAuthToken(null);
    setUser(null);
    setProjects([]);
    setResumeHistory([]);
    setSelectedPage("Login");
  };

  const loadUserContent = async () => {
    try {
      const [projectsRes, historyRes] = await Promise.all([
        listProjects(),
        getResumeHistory(),
      ]);

      if (projectsRes?.data?.success) {
        setProjects(projectsRes.data.data);
      }
      if (historyRes?.data?.success) {
        setResumeHistory(historyRes.data.data);
      }
    } catch (error) {
      console.error("Failed to load user content", error);
    }
  };

  const handleAuthSuccess = async (token, userData) => {
    persistAuth(token, userData);
    await loadUserContent();
    setSelectedPage("Dashboard");
  };

  const handleAnalyze = async (file) => {
    if (!file) {
      window.alert("Please choose a resume file before analyzing.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      const res = await uploadResume(formData);

      if (res?.data?.success) {
        setResumeData(res.data.data);
        setResumeText(res.data.resumeText || "");
        setSelectedPage("Resume Analysis");
      } else {
        window.alert(
          "Resume upload failed: " + (res?.data?.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Upload failed", error);
      window.alert(
        "Unable to reach the backend. Please check that the server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-shell">
      <Sidebar
        selectedPage={selectedPage}
        onChangePage={setSelectedPage}
        menuItems={allowedPages}
        user={user}
        onLogout={clearAuth}
      />
      <main className="main-panel">
        <Page
          resumeData={resumeData}
          resumeText={resumeText}
          onAnalyze={handleAnalyze}
          loading={loading}
          currentUser={user}
          onAuthSuccess={handleAuthSuccess}
          projects={projects}
          resumeHistory={resumeHistory}
        />
      </main>
    </div>
  );
};

export default Home;
