import React, { useState } from "react";
import { rewriteBullet } from "../services/api";
import { Copy, CheckCheck, Sparkles } from "lucide-react";

const ResumeRewriterPage = ({ resumeText }) => {
  const [bullet, setBullet] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accepted, setAccepted] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleRewrite = async () => {
    if (!bullet.trim()) { setError("Enter a bullet point to rewrite."); return; }
    setError(null);
    setResults(null);
    setAccepted(null);
    try {
      setLoading(true);
      const r = await rewriteBullet(bullet.trim(), resumeText);
      if (r?.data?.success) setResults(r.data.data);
      else setError(r?.data?.error || "Rewrite failed.");
    } catch {
      setError("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Resume Rewriter</span>
          <h2>Improve your bullet points instantly</h2>
          <p className="panel-description">
            Paste any weak resume bullet point and get 3 AI-rewritten versions
            with stronger action verbs and measurable impact.
          </p>
        </div>
      </div>

      <section className="card">
        <div className="card-title">Paste a Bullet Point</div>
        <textarea
          className="rewrite-input"
          value={bullet}
          onChange={(e) => setBullet(e.target.value)}
          placeholder="e.g. Worked on the backend API..."
          rows={3}
        />
        {error && <div className="status-message error" style={{ marginTop: 10 }}>{error}</div>}
        <button
          type="button"
          className="primary-button"
          style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}
          onClick={handleRewrite}
          disabled={loading}
        >
          <Sparkles size={15} />
          {loading ? "Rewriting..." : "Rewrite with AI"}
        </button>
      </section>

      {results && (
        <section className="card rewrite-card">
          <div className="card-title">Original</div>
          <div className="text-box" style={{ marginBottom: 20 }}>{results.original}</div>

          <div className="card-title">AI Suggestions — pick the best one</div>
          <div className="suggestion-list">
            {results.suggestions?.map((s, i) => (
              <div
                key={i}
                className={`suggestion-item ${accepted === i ? "accepted" : ""}`}
                onClick={() => setAccepted(i)}
              >
                <span className="suggestion-num">{i + 1}</span>
                <span className="suggestion-text">{s}</span>
                <div className="suggestion-actions">
                  {accepted === i && (
                    <span className="accepted-badge">Selected</span>
                  )}
                  <button
                    type="button"
                    className="icon-btn secondary-button"
                    onClick={(e) => { e.stopPropagation(); handleCopy(s); }}
                  >
                    {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ResumeRewriterPage;
