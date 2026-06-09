import React from "react";

const ResumeAnalysisPage = ({ resumeData }) => {
  const strengths = resumeData?.strengths || ["React", "TypeScript", "Testing"];
  const missingSkills = resumeData?.missingSkills || [
    "No missing keywords detected.",
  ];
  const improvements = resumeData?.improvements || [
    "No suggestions available.",
  ];
  const atsScore = resumeData?.atsScore ?? resumeData?.score;
  const roles = resumeData?.recommendedRoles || [];
  const experience = resumeData?.experienceYears
    ? `${resumeData.experienceYears} years`
    : "—";
  const fitLabel =
    atsScore >= 80
      ? "Excellent"
      : atsScore >= 60
        ? "Good"
        : "Needs improvement";

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Resume Analysis</span>
          <h2>Deep ATS scoring and keyword intelligence</h2>
          <p className="panel-description">
            Understand where your resume succeeds and where it needs improvement
            to pass automated screening.
          </p>
        </div>
      </div>

      <div className="panel-grid analysis-grid">
        <section className="card score-detail-card">
          <div className="card-title">ATS Performance</div>
          <div className="score-card-block">
            <div className="score-ring large">
              <div className="score-value-large">
                {atsScore !== undefined && atsScore !== null
                  ? `${atsScore}%`
                  : "—"}
              </div>
            </div>
            <p className="card-copy">
              This score reflects keyword match, structure, and resume quality.
            </p>
          </div>
          <div className="score-metrics">
            <div>
              <span>Experience</span>
              <strong>{experience}</strong>
            </div>
            <div>
              <span>Recommended roles</span>
              <strong>{roles.length ? roles.join(", ") : "—"}</strong>
            </div>
            <div>
              <span>Fit level</span>
              <strong>
                {atsScore !== undefined && atsScore !== null ? fitLabel : "—"}
              </strong>
            </div>
          </div>
        </section>

        <section className="card detail-card">
          <div className="card-title">Resume Strengths</div>
          <ul className="icon-list">
            {strengths.map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        </section>

        <section className="card detail-card negative-card">
          <div className="card-title">Missing Keywords</div>
          <ul className="icon-list negative">
            {missingSkills.map((item) => (
              <li key={item}>✗ {item}</li>
            ))}
          </ul>
        </section>

        <section className="card detail-card">
          <div className="card-title">Recommendations</div>
          <ul className="icon-list">
            {improvements.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;
