import React, { useState } from "react";
import { matchResume } from "../services/api";

const JobMatchPage = ({ resumeText }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!resumeText) {
      window.alert(
        "Upload a resume first so we can compare it to the job description.",
      );
      return;
    }

    if (!jobDescription.trim()) {
      window.alert("Please paste a job description to compare.");
      return;
    }

    try {
      setLoading(true);
      const response = await matchResume(resumeText, jobDescription.trim());

      if (response?.data?.success) {
        setResults(response.data.data);
      } else {
        window.alert(
          "Job match failed: " + (response?.data?.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Match failed", error);
      window.alert(
        "Unable to connect to the backend. Please make sure the server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const matchScore = results?.matchScore ?? 0;
  const fitLabel =
    matchScore >= 80
      ? "Strong Match"
      : matchScore >= 60
        ? "Potential Match"
        : "Improvement Needed";
  const missingCount = results?.missingKeywords?.length ?? 0;

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Job Match</span>
          <h2>Mirror Jobscan-style job matching</h2>
          <p className="panel-description">
            Paste a job description and compare it against your uploaded resume
            for fit, keywords, and improvement guidance.
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
          {!resumeText && (
            <p className="card-copy info-note">
              Upload a resume first to compare it against this job description.
            </p>
          )}
        </section>

        <section className="card summary-card">
          <div className="card-title">Match Overview</div>
          <p className="card-copy">
            This section shows whether your resume aligns with the target job
            description and what to improve.
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
            <strong>
              {results ? "Review keywords" : "Paste JD and compare"}
            </strong>
          </div>
        </section>
      </div>

      {results ? (
        <section className="card results-card">
          <div className="result-top">
            <div>
              <div className="card-title">Match Score</div>
              <div className="score-value large">{matchScore}%</div>
            </div>
            <div className="match-badge">{fitLabel}</div>
          </div>

          <p className="card-copy">
            {results.fitAnalysis ||
              "This job description is now matched against your resume."}
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
      ) : (
        <section className="card results-card placeholder-card">
          <p>
            Enter a job description and click compare to view your match score.
          </p>
        </section>
      )}
    </div>
  );
};

export default JobMatchPage;
