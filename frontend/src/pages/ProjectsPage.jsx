import React, { useEffect, useState } from "react";
import { listProjects, createProject } from "../services/api";

const ProjectsPage = ({ projects: initial = [] }) => {
  const [projects, setProjects] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (!initial || initial.length === 0) fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await listProjects();
      if (res?.data?.success) setProjects(res.data.data || []);
    } catch (err) {
      console.error("Error loading projects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !summary) return alert("Title and summary required");
    try {
      setLoading(true);
      const res = await createProject({ title, summary, technologies: [] });
      if (res?.data?.success) {
        setProjects((p) => [res.data.data, ...p]);
        setTitle("");
        setSummary("");
      }
    } catch (err) {
      console.error("Create project failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Projects</span>
          <h2>Your portfolio projects</h2>
          <p className="panel-description">
            Save projects to include on your resume.
          </p>
        </div>
      </div>

      <section className="card">
        <form className="form-grid" onSubmit={handleCreate}>
          <div className="form-field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Summary</label>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add project"}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        {loading ? (
          <div className="placeholder-card">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="placeholder-card">No projects yet.</div>
        ) : (
          <ul className="simple-list">
            {projects.map((p) => (
              <li key={p.id} className="card-subgrid">
                <div>
                  <strong>{p.title}</strong>
                  <div className="card-copy">{p.summary}</div>
                </div>
                <div>
                  <small className="card-copy">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ProjectsPage;
