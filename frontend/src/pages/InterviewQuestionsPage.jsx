import React, { useState } from "react";
import { generateInterviewQuestions } from "../services/api";
import { Search } from "lucide-react";

const TABS = ["Technical", "Behavioral", "SystemDesign"];
const TAB_LABELS = { Technical: "Technical", Behavioral: "Behavioral", SystemDesign: "System Design" };

const InterviewQuestionsPage = ({ resumeText }) => {
  const [jobRole, setJobRole] = useState("");
  const [questions, setQuestions] = useState(null);
  const [activeTab, setActiveTab] = useState("Technical");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!resumeText) { setError("Upload a resume on the Dashboard first."); return; }
    setError(null);
    try {
      setLoading(true);
      const r = await generateInterviewQuestions(resumeText, jobRole);
      if (r?.data?.success) { setQuestions(r.data.data); setActiveTab("Technical"); }
      else setError(r?.data?.error || "Generation failed.");
    } catch {
      setError("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const currentQs = questions?.[activeTab] || [];

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Interview Questions</span>
          <h2>Practice questions based on your resume</h2>
          <p className="panel-description">
            Get AI-generated interview questions tailored to your experience and
            target role, with suggested answers.
          </p>
        </div>
      </div>

      <section className="card">
        <div className="card-title">Target Job Role</div>
        <div className="input-row">
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Search size={15} className="input-icon" />
            <input
              type="text"
              placeholder="e.g. Frontend Engineer, Full Stack Developer..."
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-inverse)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 13, padding: "12px 16px 12px 40px", width: "100%" }}
            />
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={handleGenerate}
            disabled={loading || !resumeText}
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </div>
        {error && <div className="status-message error">{error}</div>}
      </section>

      {questions && (
        <section className="card tab-card">
          <div className="tab-row">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={tab === activeTab ? "tab-button active" : "tab-button"}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {currentQs.length === 0 ? (
            <p className="card-copy">No questions in this category.</p>
          ) : (
            currentQs.map((item, i) => (
              <div key={i} className="qa-block">
                <div className="qa-question">Q: {item.question}</div>
                <details>
                  <summary>Show suggested answer</summary>
                  <p>{item.answer}</p>
                </details>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
};

export default InterviewQuestionsPage;
