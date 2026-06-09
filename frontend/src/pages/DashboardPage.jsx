import React from "react";
import UploadResume from "../components/UploadResume";

const DashboardPage = ({
  resumeData,
  onAnalyze,
  loading,
  currentUser,
  projects = [],
  resumeHistory = [],
}) => {
  const atsScore = resumeData?.atsScore ?? resumeData?.score;
  const skillCount = resumeData?.skillsFound?.length ?? 0;
  const roleCount = resumeData?.recommendedRoles?.length ?? 0;
  const experience = resumeData?.experienceYears
    ? `${resumeData.experienceYears} yrs`
    : "—";
  const projectCount = projects.length;
  const historyCount = resumeHistory.length;

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Resume Dashboard</span>
          <h2>Optimize your resume with ATS insights</h2>
          <p className="panel-description">
            Upload your resume to receive instant ATS scoring, keyword guidance,
            and match recommendations.
          </p>
        </div>
        <div className="panel-actions">
          <span className="badge">Jobscan-style analyzer</span>
          {currentUser ? (
            <span className="badge secondary">
              Signed in as {currentUser.name}
            </span>
          ) : (
            <span className="badge secondary">Live feedback</span>
          )}
        </div>
      </div>

      <div className="panel-grid">
        <section className="card overview-card">
          <div className="overview-header">
            <div>
              <span className="card-title">ATS Score</span>
              <p className="card-copy">
                How well your resume performs against ATS standards.
              </p>
            </div>
            <div className="score-pill">
              {atsScore !== undefined && atsScore !== null
                ? `${atsScore}%`
                : "—"}
            </div>
          </div>
          <div className="score-ring">
            <div className="progress-value">
              {atsScore !== undefined && atsScore !== null
                ? `${atsScore}%`
                : "—"}
            </div>
          </div>
          <div className="score-summary">
            <p>
              {resumeData
                ? "Strong structure and keyword relevance detected. Keep refining to improve your fit."
                : "Upload a resume to generate a score."}
            </p>
          </div>
        </section>

        <section className="card stats-card">
          <div className="stat-item">
            <span className="stat-label">Tracked keywords</span>
            <strong>{skillCount}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Experience</span>
            <strong>{experience}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Saved projects</span>
            <strong>{projectCount}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Resume uploads</span>
            <strong>{historyCount}</strong>
          </div>
          <div className="stat-item full-width">
            <span className="stat-label">Top skills</span>
            <p>
              {resumeData
                ? resumeData.skillsFound.join(", ")
                : "No skills found yet."}
            </p>
          </div>
        </section>
      </div>

      <section className="card upload-card">
        <div className="upload-panel-header">
          <div>
            <span className="card-title">Upload Your Resume</span>
            <p className="card-copy">
              Drop a PDF, DOC, or DOCX file and let the platform analyze it.
            </p>
          </div>
          <span className="badge tertiary">Recommended</span>
        </div>
        <UploadResume onAnalyze={onAnalyze} loading={loading} />
      </section>
    </div>
  );
};

export default DashboardPage;
