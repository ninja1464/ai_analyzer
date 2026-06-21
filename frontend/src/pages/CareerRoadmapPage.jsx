import React, { useState } from "react";
import { generateCareerRoadmap } from "../services/api";
import { Search } from "lucide-react";

const CareerRoadmapPage = ({ resumeText }) => {
  const [targetRole, setTargetRole] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!resumeText) { setError("Upload a resume on the Dashboard first."); return; }
    setError(null);
    try {
      setLoading(true);
      const r = await generateCareerRoadmap(resumeText, targetRole);
      if (r?.data?.success) setResults(r.data.data);
      else setError(r?.data?.error || "Generation failed.");
    } catch {
      setError("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Career Roadmap</span>
          <h2>Your personalized path to the next role</h2>
          <p className="panel-description">
            Enter your target role and get a step-by-step 6-month roadmap built
            from your resume.
          </p>
        </div>
      </div>

      <section className="card">
        <div className="card-title">Target Role</div>
        <div className="input-row">
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Search size={15} className="input-icon" />
            <input
              type="text"
              placeholder="e.g. Senior Backend Engineer, Engineering Manager..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
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
            {loading ? "Generating..." : "Generate Roadmap"}
          </button>
        </div>
        {error && <div className="status-message error">{error}</div>}
      </section>

      {results && (
        <>
          <section className="card">
            <div className="roadmap-meta">
              <div className="roadmap-meta-item">
                <span>Current Level</span>
                <strong>{results.currentLevel}</strong>
              </div>
              <div className="roadmap-arrow">→</div>
              <div className="roadmap-meta-item">
                <span>Target Role</span>
                <strong>{results.targetRole}</strong>
              </div>
            </div>
            {results.summary && (
              <p className="card-copy" style={{ marginTop: 16 }}>{results.summary}</p>
            )}
          </section>

          <section className="card roadmap-card">
            <div className="card-title">6-Month Roadmap</div>
            <div className="roadmap-list">
              {results.milestones?.map((m, i) => (
                <div key={i} className="roadmap-item">
                  <div className="roadmap-period">{m.period}</div>
                  <div className="roadmap-content">
                    <strong>{m.title}</strong>
                    <ul>
                      {m.items?.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default CareerRoadmapPage;
