import React, { useState, useEffect } from "react";
import {
  prepareApplication,
  submitApplication,
  confirmManualSubmission,
  searchJobs,
  getApplicationScreenshotBlob,
  getApplicationConfirmationScreenshotBlob,
} from "../services/api";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  ListChecks,
} from "lucide-react";
import StatusPill from "../components/StatusPill";

const StepTrack = ({ steps }) => (
  <div className="step-track">
    {steps.map((step, i) => (
      <React.Fragment key={step.label}>
        <div className={`step ${step.done ? "done" : step.active ? "active" : ""}`}>
          <span className="step-number">{step.done ? "✓" : i + 1}</span>
          {step.label}
        </div>
        {i < steps.length - 1 && <div className="step-connector" />}
      </React.Fragment>
    ))}
  </div>
);

const ApplicationCard = ({ application: initialApplication }) => {
  const [application, setApplication] = useState(initialApplication);
  const [submitting, setSubmitting] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [confirmationScreenshotUrl, setConfirmationScreenshotUrl] = useState(null);
  const [error, setError] = useState(null);
  const [showResume, setShowResume] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  useEffect(() => {
    if (!application.screenshotPath) return;
    let cancelled = false;
    getApplicationScreenshotBlob(application.id)
      .then((res) => !cancelled && setScreenshotUrl(URL.createObjectURL(res.data)))
      .catch(() => !cancelled && setScreenshotUrl(null));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.id, application.screenshotPath]);

  const handleSubmit = async () => {
    setError(null);
    try {
      setSubmitting(true);
      const res = await submitApplication(application.id);
      if (res?.data?.success) {
        setApplication(res.data.data);
        if (res.data.data.confirmationScreenshotPath) {
          try {
            const shot = await getApplicationConfirmationScreenshotBlob(application.id);
            setConfirmationScreenshotUrl(URL.createObjectURL(shot.data));
          } catch {
            setConfirmationScreenshotUrl(null);
          }
        }
      } else {
        setError(res?.data?.error || "Failed to submit application.");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to submit this application.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmManual = async () => {
    setError(null);
    try {
      setSubmitting(true);
      const res = await confirmManualSubmission(application.id);
      if (res?.data?.success) {
        setApplication(res.data.data);
      } else {
        setError(res?.data?.error || "Failed to confirm submission.");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to confirm this submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const atsScore = application?.atsScore;

  return (
    <div className="auto-apply-result">
      <section className="card results-card">
        <div className="result-top">
          <div>
            <div className="card-title">
              {application.jobTitle || "Job"} · {application.company || application.atsPlatform}
            </div>
            <StatusPill status={application.status} />
          </div>
          {atsScore && <div className="score-value large">{atsScore.overall}%</div>}
        </div>

        {atsScore && (
          <>
            <div className="summary-stat">
              <span>Keyword overlap</span>
              <strong>{atsScore.keywordScore}%</strong>
            </div>
            <div className="summary-stat">
              <span>Resume structure</span>
              <strong>{atsScore.structureScore}%</strong>
            </div>
            {atsScore.llmScore !== null && (
              <div className="summary-stat">
                <span>AI fit score</span>
                <strong>{atsScore.llmScore}%</strong>
              </div>
            )}
            <div className="card-subgrid">
              <div>
                <div className="subcard-title">Missing Keywords</div>
                <ul className="icon-list negative">
                  {atsScore.missingKeywords?.length > 0 ? (
                    atsScore.missingKeywords.map((k) => <li key={k}>{k}</li>)
                  ) : (
                    <li>None detected.</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="subcard-title">Format Warnings</div>
                <ul className="icon-list neutral">
                  {atsScore.formatWarnings?.length > 0 ? (
                    atsScore.formatWarnings.map((w, i) => <li key={i}>{w}</li>)
                  ) : (
                    <li>No formatting issues detected.</li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="card generate-card">
        <button
          type="button"
          className="collapsible-toggle"
          onClick={() => setShowResume((v) => !v)}
        >
          {showResume ? <ChevronUp size={14} /> : <ChevronDown size={14} />}{" "}
          {showResume ? "Hide" : "Show"} tailored resume
        </button>
        {showResume && <pre className="generated-text">{application.tailoredResumeText}</pre>}
      </section>

      {application.coverLetterText && (
        <section className="card generate-card">
          <button
            type="button"
            className="collapsible-toggle"
            onClick={() => setShowCoverLetter((v) => !v)}
          >
            {showCoverLetter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}{" "}
            {showCoverLetter ? "Hide" : "Show"} cover letter
          </button>
          {showCoverLetter && <pre className="generated-text">{application.coverLetterText}</pre>}
        </section>
      )}

      <section className="card results-card">
        <div className="card-title">Next Step</div>

        {application.dryRun && (
          <p className="card-copy info-note">
            Dry-run mode is on — the form will be filled and screenshotted but
            never actually submitted.
          </p>
        )}

        {!application.autoFillSupported && (
          <div className="status-message info-note">
            {application.manualApplyMessage}
            {application.applyUrl && (
              <div className="form-actions">
                <a
                  href={application.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-button icon-btn"
                >
                  <ExternalLink size={15} /> Open job posting
                </a>
              </div>
            )}
          </div>
        )}

        {application.autoFillSupported && application.status === "draft" && (
          <div className="status-message error">
            <AlertTriangle size={15} /> We couldn't auto-fill this form
            ({application.error || "unknown error"}). Use the materials
            above to apply manually.
          </div>
        )}

        {screenshotUrl && (
          <div className="text-box">
            <div className="subcard-title">Filled Form Preview</div>
            <img
              src={screenshotUrl}
              alt="Filled application form preview"
              style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #2a2a3d" }}
            />
          </div>
        )}

        {application.filledFields && Object.keys(application.filledFields).length > 0 && (
          <div className="text-box">
            <div className="subcard-title">Fields We Filled</div>
            <ul className="simple-list">
              {Object.entries(application.filledFields).map(([label, value]) => (
                <li key={label}>
                  <strong>{label}:</strong> {value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <div className="status-message error">{error}</div>}

        {application.status === "ready_for_review" && (
          <div className="form-actions">
            <button
              type="button"
              className="primary-button icon-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <Send size={15} />
              {submitting ? "Submitting..." : "Confirm & Submit"}
            </button>
          </div>
        )}

        {application.status === "awaiting_manual_step" && (
          <div className="status-message info-note">
            <AlertTriangle size={15} /> {application.error}
            <br />
            A real browser window has opened on this computer with the
            form filled in — switch to it, finish that step (e.g. enter
            the code from your email), and click submit there yourself.
            <div className="form-actions">
              <button
                type="button"
                className="primary-button icon-btn"
                onClick={handleConfirmManual}
                disabled={submitting}
              >
                <CheckCircle2 size={15} />
                {submitting ? "Confirming..." : "I submitted it in that window"}
              </button>
            </div>
          </div>
        )}

        {application.status === "submitted" && (
          <>
            <div className="status-message success">
              <CheckCircle2 size={15} />{" "}
              {application.dryRun
                ? "Dry run complete — the form was filled but the real submit button was never clicked (no application was actually sent)."
                : "Application submitted"}
              {!application.dryRun &&
                application.submittedAt &&
                ` on ${new Date(application.submittedAt).toLocaleString()}`}
              {!application.dryRun && "."}
            </div>
            {confirmationScreenshotUrl && (
              <div className="text-box">
                <div className="subcard-title">
                  {application.dryRun ? "Form State at Submit Time" : "Confirmation Page"}
                </div>
                <img
                  src={confirmationScreenshotUrl}
                  alt="Post-submit confirmation page"
                  style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #2a2a3d" }}
                />
              </div>
            )}
          </>
        )}

        {application.status === "failed" && (
          <>
            <div className="status-message error">
              <AlertTriangle size={15} /> {application.error || "Submission failed."}
            </div>
            {confirmationScreenshotUrl && (
              <div className="text-box">
                <div className="subcard-title">Page State When It Failed</div>
                <img
                  src={confirmationScreenshotUrl}
                  alt="Page state after failed submission attempt"
                  style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #2a2a3d" }}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

const AutoApplyPage = ({ resumeText }) => {
  const [jobUrlsText, setJobUrlsText] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [prepareStatus, setPrepareStatus] = useState(null);
  const [applications, setApplications] = useState([]);
  const [prepareErrors, setPrepareErrors] = useState([]);
  const [error, setError] = useState(null);

  const [searchKeywords, setSearchKeywords] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [addedUrls, setAddedUrls] = useState(new Set());

  const handleSearch = async () => {
    if (!searchKeywords.trim()) {
      setSearchError("Enter some keywords (e.g. your field of study or skills) first.");
      return;
    }
    setSearchError(null);
    setSearching(true);
    setSearchResults([]);
    setAddedUrls(new Set());
    try {
      const res = await searchJobs(searchKeywords.trim(), searchLocation.trim());
      if (res?.data?.success) {
        setSearchResults(res.data.data);
      } else {
        setSearchError(res?.data?.error || "Job search failed.");
      }
    } catch (err) {
      setSearchError(err?.response?.data?.error || "Unable to search for jobs right now.");
    } finally {
      setSearching(false);
    }
  };

  const handleAddJobUrl = (url) => {
    setJobUrlsText((prev) => {
      const existing = new Set(prev.split("\n").map((u) => u.trim()).filter(Boolean));
      existing.add(url);
      return [...existing].join("\n");
    });
    setAddedUrls((prev) => new Set(prev).add(url));
  };

  const handlePrepareAll = async () => {
    if (!resumeText) {
      setError("Upload a resume first so we can tailor it to each job.");
      return;
    }

    const urls = [...new Set(jobUrlsText.split("\n").map((u) => u.trim()).filter(Boolean))];
    if (urls.length === 0) {
      setError("Paste at least one job posting URL first.");
      return;
    }

    setError(null);
    setApplications([]);
    setPrepareErrors([]);
    setPreparing(true);

    for (let i = 0; i < urls.length; i++) {
      setPrepareStatus(
        urls.length > 1 ? `Preparing ${i + 1} of ${urls.length}...` : "Preparing...",
      );
      try {
        const res = await prepareApplication(urls[i], resumeText);
        if (res?.data?.success) {
          setApplications((prev) => [...prev, res.data.data]);
        } else {
          setPrepareErrors((prev) => [
            ...prev,
            { jobUrl: urls[i], error: res?.data?.error || "Failed to prepare application." },
          ]);
        }
      } catch (err) {
        setPrepareErrors((prev) => [
          ...prev,
          {
            jobUrl: urls[i],
            error: err?.response?.data?.error || "Unable to prepare this application.",
          },
        ]);
      }
    }

    setPreparing(false);
    setPrepareStatus(null);
  };

  const hasUrls = jobUrlsText.trim().length > 0;
  const hasApplications = applications.length > 0;
  const hasSubmitted = applications.some((a) => a.status === "submitted");
  const hasActionable = applications.some(
    (a) => a.status === "ready_for_review" || a.status === "awaiting_manual_step",
  );

  const steps = [
    { label: "Find Jobs", done: hasUrls || hasApplications, active: !hasUrls && !hasApplications },
    { label: "Prepare", done: hasApplications, active: hasUrls && !hasApplications },
    { label: "Review", done: hasSubmitted, active: hasApplications && !hasSubmitted },
    { label: "Submit", done: hasSubmitted, active: hasActionable && !hasSubmitted },
  ];

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Auto Apply</span>
          <h2>Apply to jobs automatically</h2>
          <p className="panel-description">
            Paste one or more job posting URLs (one per line) from a company's
            Greenhouse or Lever page. We'll tailor your resume to each one,
            score it against the job, fill out the real application form,
            and let you review and submit each one yourself.
          </p>
        </div>
      </div>

      <StepTrack steps={steps} />

      <section className="card textarea-card">
        <div className="card-title">Find Jobs</div>
        <p className="card-copy">
          Search real job postings (via Adzuna) and add matching ones straight
          into the batch below. We can't tell in advance whether a result is
          on Greenhouse/Lever (auto-fillable) — adding it will still tailor a
          resume/cover letter and score it; if the form can't be auto-filled,
          open "View posting" yourself to find the real apply link.
        </p>
        <div className="input-row">
          <input
            type="text"
            className="auth-field"
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
            placeholder="e.g. Applied AI Engineer, Generative AI, Machine Learning"
          />
          <input
            type="text"
            className="auth-field"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Location (e.g. Berlin)"
          />
        </div>
        <button
          type="button"
          className="primary-button icon-btn"
          onClick={handleSearch}
          disabled={searching}
        >
          <Search size={15} />
          {searching ? "Searching..." : "Search Jobs"}
        </button>
        {searchError && <div className="status-message error">{searchError}</div>}

        {searchResults.length > 0 && (
          <div className="text-box">
            <ul className="simple-list">
              {searchResults.map((job) => {
                const added = addedUrls.has(job.url);
                return (
                  <li key={job.url} className="card-subgrid job-result-row">
                    <button
                      type="button"
                      className="job-result-click"
                      onClick={() => handleAddJobUrl(job.url)}
                      title="Add this job's URL to the batch below"
                    >
                      <strong>{job.title}</strong>
                      <div className="card-copy">{job.company} · {job.location}</div>
                    </button>
                    <div className="job-result-actions">
                      {added ? (
                        <span className="status-pill status-submitted">
                          <CheckCircle2 size={14} /> Added
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => handleAddJobUrl(job.url)}
                        >
                          Add
                        </button>
                      )}
                      <a href={job.url} target="_blank" rel="noreferrer" className="card-copy">
                        View posting
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <section className="card textarea-card">
        <div className="card-title">Job Posting URL(s) — one per line</div>
        <div className="input-row">
          <textarea
            className="auth-field"
            rows={4}
            value={jobUrlsText}
            onChange={(e) => setJobUrlsText(e.target.value)}
            placeholder={
              "https://boards.greenhouse.io/company/jobs/12345\nhttps://jobs.lever.co/company/abcde-fghij"
            }
          />
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={handlePrepareAll}
          disabled={preparing}
        >
          {preparing ? prepareStatus || "Preparing..." : "Prepare Application(s)"}
        </button>
        {error && <div className="status-message error">{error}</div>}
      </section>

      {prepareErrors.length > 0 && (
        <section className="card">
          <div className="card-title">Couldn't prepare these</div>
          <ul className="simple-list">
            {prepareErrors.map((e, i) => (
              <li key={i}>
                <strong>{e.jobUrl}</strong> — {e.error}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasApplications && !preparing && prepareErrors.length === 0 && (
        <div className="placeholder-card">
          <ListChecks size={22} style={{ marginBottom: 8, opacity: 0.6 }} />
          <div>
            Search for jobs or paste a posting URL above, then hit "Prepare" —
            your tailored applications will show up here, ready to review.
          </div>
        </div>
      )}

      {applications.map((app) => (
        <ApplicationCard key={app.id} application={app} />
      ))}
    </div>
  );
};

export default AutoApplyPage;
