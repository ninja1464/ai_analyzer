import React from "react";

const ResultCard = ({ result }) => {
  if (!result) {
    return (
      <div className="result-placeholder">
        <h2>Ready to review your resume</h2>
        <p>
          Upload a document to see a professional summary of score, strengths,
          and action items.
        </p>
      </div>
    );
  }

  const strengths = Array.isArray(result.strengths) ? result.strengths : [];
  const missingSkills = Array.isArray(result.missingSkills)
    ? result.missingSkills
    : [];
  const improvements = Array.isArray(result.improvements)
    ? result.improvements
    : [];

  return (
    <section className="result-card">
      <div className="result-header">
        <div>
          <span className="result-label">Resume Score</span>
          <strong className="result-score">{result.score ?? "N/A"}/100</strong>
        </div>
        <p className="result-summary">
          Use this feedback to refine your resume language, skills, and
          structure.
        </p>
      </div>

      <div className="result-grid">
        <div className="result-block">
          <h3>Strengths</h3>
          <ul>
            {strengths.length > 0 ? (
              strengths.map((item, index) => <li key={index}>{item}</li>)
            ) : (
              <li>No strengths were detected.</li>
            )}
          </ul>
        </div>

        <div className="result-block">
          <h3>Missing Skills</h3>
          <ul>
            {missingSkills.length > 0 ? (
              missingSkills.map((item, index) => <li key={index}>{item}</li>)
            ) : (
              <li>No missing skills were detected.</li>
            )}
          </ul>
        </div>

        <div className="result-block">
          <h3>Improvements</h3>
          <ul>
            {improvements.length > 0 ? (
              improvements.map((item, index) => <li key={index}>{item}</li>)
            ) : (
              <li>No suggestions available.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ResultCard;
