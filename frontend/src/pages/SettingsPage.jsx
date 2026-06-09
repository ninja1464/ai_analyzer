import React from "react";

const SettingsPage = ({ currentUser, onLogout }) => {
  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Settings</span>
          <h2>Account</h2>
          <p className="panel-description">
            Manage your account and preferences.
          </p>
        </div>
      </div>

      <section className="card">
        <div className="form-field">
          <label>Name</label>
          <div>{currentUser?.name || "—"}</div>
        </div>
        <div className="form-field">
          <label>Email</label>
          <div>{currentUser?.email || "—"}</div>
        </div>
        <div className="form-actions">
          <button className="secondary-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </section>
    </div>
  );
};
export default SettingsPage;
