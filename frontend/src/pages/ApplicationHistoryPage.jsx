import React, { useEffect, useState } from "react";
import { listApplications } from "../services/api";
import { Inbox } from "lucide-react";
import StatusPill from "../components/StatusPill";

const GROUPS = [
  {
    heading: "Needs your action",
    statuses: ["awaiting_manual_step", "ready_for_review", "draft"],
  },
  { heading: "Submitted", statuses: ["submitted"] },
  { heading: "Failed", statuses: ["failed"] },
];

const ApplicationRow = ({ app }) => (
  <li className="card-subgrid">
    <div>
      <strong>{app.jobTitle || "Untitled role"}</strong>
      <div className="card-copy">
        {app.company || app.atsPlatform} · {app.atsPlatform}
      </div>
      <small className="card-copy">
        Prepared: {new Date(app.createdAt).toLocaleString()}
      </small>
      {app.atsScore?.overall !== undefined && (
        <small className="card-copy"> · ATS score: {app.atsScore.overall}%</small>
      )}
    </div>
    <div>
      <StatusPill status={app.status} />
      <div className="button-row">
        <a href={app.jobUrl} target="_blank" rel="noreferrer" className="secondary-button">
          View posting
        </a>
      </div>
    </div>
  </li>
);

const ApplicationHistoryPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await listApplications();
      if (res?.data?.success) {
        const sorted = [...res.data.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setApplications(sorted);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoading(false);
    }
  };

  const counts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});
  const needsAction = (counts.awaiting_manual_step || 0) + (counts.ready_for_review || 0);

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">My Applications</span>
          <h2>Application history</h2>
          <p className="panel-description">
            Every job you've prepared or submitted through Auto Apply.
          </p>
        </div>
      </div>

      {applications.length > 0 && (
        <div className="stat-row">
          <div className={`stat-tile ${needsAction > 0 ? "stat-highlight" : ""}`}>
            <div className="stat-value">{needsAction}</div>
            <div className="stat-label">Needs your action</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">{counts.submitted || 0}</div>
            <div className="stat-label">Submitted</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">{counts.failed || 0}</div>
            <div className="stat-label">Failed</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">{applications.length}</div>
            <div className="stat-label">Total prepared</div>
          </div>
        </div>
      )}

      <section className="card">
        {loading ? (
          <div className="placeholder-card">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="placeholder-card">
            <Inbox size={22} style={{ marginBottom: 8, opacity: 0.6 }} />
            <div>No applications yet — use Auto Apply to prepare your first one.</div>
          </div>
        ) : (
          GROUPS.map(({ heading, statuses }) => {
            const group = applications.filter((app) => statuses.includes(app.status));
            if (group.length === 0) return null;
            return (
              <div key={heading}>
                <div className="group-heading">{heading}</div>
                <ul className="simple-list">
                  {group.map((app) => (
                    <ApplicationRow key={app.id} app={app} />
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default ApplicationHistoryPage;
