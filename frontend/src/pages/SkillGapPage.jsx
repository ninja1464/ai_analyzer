import React, { useState } from "react";
import { analyzeSkillGap } from "../services/api";
import { Search } from "lucide-react";

const SkillGapPage = ({ resumeText }) => {
  const [targetRole, setTargetRole] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!resumeText) { setError("Upload a resume on the Dashboard first."); return; }
    setError(null);
    try {
      setLoading(true);
      const r = await analyzeSkillGap(resumeText, targetRole);
      if (r?.data?.success) setResults(r.data.data);
      else setError(r?.data?.error || "Analysis failed.");
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
          <span className="section-tag">Skill Gap</span>
          <h2>Identify what skills you need</h2>
          <p className="panel-description">
            Enter your target role and get a personalized skill gap analysis
            based on your uploaded resume.
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
              placeholder="e.g. Senior React Developer, Data Engineer, DevOps..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-inverse)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 13, padding: "12px 16px 12px 40px", width: "100%" }}
            />
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={handleAnalyze}
            disabled={loading || !resumeText}
          >
            {loading ? "Analyzing..." : "Analyze Gap"}
          </button>
        </div>
        {error && <div className="status-message error">{error}</div>}
      </section>

      {results && (
        <>
          <div className="panel-grid">
            <section className="card">
              <div className="card-title">Your Current Skills</div>
              <div className="skill-chips">
                {results.currentSkills?.map((s) => (
                  <span key={s} className="skill-chip">{s}</span>
                ))}
              </div>
            </section>
            <section className="card">
              <div className="card-title">Skills to Learn for {results.targetRole}</div>
              <ul className="gap-list">
                {results.missingSkills?.map((s) => (
                  <li key={s.skill}>
                    <div>
                      <strong>{s.skill}</strong>
                      <span className="gap-reason">{s.reason}</span>
                    </div>
                    <span className={`priority ${s.priority.toLowerCase()}`}>
                      {s.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          {results.summary && (
            <section className="card">
              <div className="card-title">Summary</div>
              <p className="card-copy">{results.summary}</p>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default SkillGapPage;
