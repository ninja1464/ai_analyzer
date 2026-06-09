import React, { useEffect, useState } from "react";
import { getResumeHistory } from "../services/api";

const ResumeHistoryPage = ({ resumeHistory: initialHistory = [] }) => {
  const [history, setHistory] = useState(initialHistory);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialHistory || initialHistory.length === 0) fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getResumeHistory();
      if (res?.data?.success) setHistory(res.data.data || []);
    } catch (err) {
      console.error("Error loading resume history", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Resume History</span>
          <h2>Your past uploads</h2>
          <p className="panel-description">View previously analyzed resumes.</p>
        </div>
      </div>

      <section className="card">
        {loading ? (
          <div className="placeholder-card">Loading...</div>
        ) : history.length === 0 ? (
          <div className="placeholder-card">No resume uploads yet.</div>
        ) : (
          <ul className="simple-list">
            {history.map((item) => (
              <li key={item.id} className="card-subgrid">
                <div>
                  <strong>{item.title}</strong>
                  <div className="card-copy">{item.summary}</div>
                  <small className="card-copy">
                    Uploaded: {new Date(item.uploadedAt).toLocaleString()}
                  </small>
                </div>
                <div>
                  <div className="button-row">
                    <button
                      className="secondary-button"
                      onClick={() => alert(JSON.stringify(item, null, 2))}
                    >
                      View
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ResumeHistoryPage;
