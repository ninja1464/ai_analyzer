import React, { useState } from "react";
import { matchResume, generateResume } from "../services/api";
import { FileDown, Copy, Sparkles, CheckCheck } from "lucide-react";

const JobMatchPage = ({ resumeText }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!resumeText) {
      setError("Upload a resume first so we can compare it to the job description.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste a job description to compare.");
      return;
    }

    setGeneratedResume(null);
    setError(null);
    try {
      setLoading(true);
      const response = await matchResume(resumeText, jobDescription.trim());
      if (response?.data?.success) {
        setResults(response.data.data);
      } else {
        setError(response?.data?.error || "Job match failed.");
      }
    } catch (err) {
      console.error("Match failed", err);
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setGeneratedResume(null);
      const response = await generateResume(resumeText, jobDescription.trim(), results);
      if (response?.data?.success) {
        setGeneratedResume(response.data.data.generatedResume);
      } else {
        setError(response?.data?.error || "Resume generation failed.");
      }
    } catch (err) {
      console.error("Generate failed", err);
      setError("Unable to generate resume. Please check the server is running.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedResume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tailored-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const matchScore = results?.matchScore ?? 0;
  const fitLabel =
    matchScore >= 80 ? "Strong Match" : matchScore >= 60 ? "Potential Match" : "Improvement Needed";
  const missingCount = results?.missingKeywords?.length ?? 0;

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Job Match</span>
          <h2>Match & generate a tailored resume</h2>
          <p className="panel-description">
            Paste a job description to get your match score, then generate a
            resume tailored to that role.
          </p>
        </div>
      </div>

      <div className="panel-grid jobmatch-grid">
        <section className="card textarea-card">
          <div className="card-title">Paste Job Description</div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
          />
          <button
            type="button"
            className="primary-button"
            onClick={handleCompare}
            disabled={loading}
          >
            {loading ? "Comparing..." : "Compare"}
          </button>
          {error && (
            <div className="status-message error">{error}</div>
          )}
          {!resumeText && (
            <p className="card-copy info-note">
              Upload a resume first to compare it against this job description.
            </p>
          )}
        </section>

        <section className="card summary-card">
          <div className="card-title">Match Overview</div>
          <p className="card-copy">
            See how well your resume aligns with the job and generate an
            optimized version in one click.
          </p>
          <div className="summary-stat">
            <span>Resume uploaded</span>
            <strong>{resumeText ? "Yes" : "No"}</strong>
          </div>
          <div className="summary-stat">
            <span>JD length</span>
            <strong>{jobDescription.length} chars</strong>
          </div>
          <div className="summary-stat">
            <span>Action</span>
            <strong>{results ? "Review & generate" : "Paste JD and compare"}</strong>
          </div>
        </section>
      </div>

      {results ? (
        <>
          <section className="card results-card">
            <div className="result-top">
              <div>
                <div className="card-title">Match Score</div>
                <div className="score-value large">{matchScore}%</div>
              </div>
              <div className="match-badge">{fitLabel}</div>
            </div>

            <p className="card-copy">
              {results.fitAnalysis || "Resume matched against the job description."}
            </p>

            <div className="card-subgrid">
              <div>
                <div className="subcard-title">Missing Keywords</div>
                <ul className="icon-list negative">
                  {missingCount > 0 ? (
                    results.missingKeywords.map((skill) => (
                      <li key={skill}>✗ {skill}</li>
                    ))
                  ) : (
                    <li>None detected. Your resume looks relevant.</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="subcard-title">Suggestions</div>
                <ul className="icon-list">
                  {results.improvementSuggestions?.length > 0 ? (
                    results.improvementSuggestions.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))
                  ) : (
                    <li>No suggestions available.</li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          <section className="card generate-card">
            <div className="generate-header">
              <div>
                <div className="card-title">Tailored Resume</div>
                <p className="card-copy">
                  Generate a version of your resume rewritten to match this
                  job&apos;s keywords and requirements.
                </p>
              </div>
              <button
                type="button"
                className="primary-button generate-btn"
                onClick={handleGenerate}
                disabled={generating}
              >
                <Sparkles size={16} />
                {generating ? "Generating..." : "Generate Resume"}
              </button>
            </div>

            {generating && (
              <div className="generate-loading">
                <div className="generate-spinner" />
                <span>AI is rewriting your resume for this role…</span>
              </div>
            )}

            {generatedResume && (
              <div className="generated-output">
                <div className="generated-actions">
                  <button
                    type="button"
                    className="secondary-button icon-btn"
                    onClick={handleCopy}
                  >
                    {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    type="button"
                    className="secondary-button icon-btn"
                    onClick={handleDownload}
                  >
                    <FileDown size={15} />
                    Download .txt
                  </button>
                </div>
                <pre className="generated-text">{generatedResume}</pre>
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="card results-card placeholder-card">
          <p>Enter a job description and click compare to view your match score.</p>
        </section>
      )}
    </div>
  );
};

export default JobMatchPage;
