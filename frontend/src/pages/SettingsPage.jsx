import React, { useEffect, useState } from "react";
import { getApplicantProfile, updateApplicantProfile } from "../services/api";

const emptyProfile = {
  firstName: "",
  lastName: "",
  phone: "",
  location: "",
  linkedinUrl: "",
  portfolioUrl: "",
  githubUrl: "",
  currentCompany: "",
  workAuthorization: "",
  noticePeriod: "",
};

const SettingsPage = ({ currentUser, onLogout }) => {
  const [profile, setProfile] = useState(emptyProfile);
  const [needsSponsorship, setNeedsSponsorship] = useState(false);
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getApplicantProfile();
      if (res?.data?.success && res.data.data) {
        setProfile({ ...emptyProfile, ...res.data.data });
        setNeedsSponsorship(Boolean(res.data.data.needsSponsorship));
        setWillingToRelocate(Boolean(res.data.data.willingToRelocate));
      }
    } catch (err) {
      console.error("Failed to load applicant profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) =>
    setProfile((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaved(false);
      const res = await updateApplicantProfile({
        ...profile,
        needsSponsorship,
        willingToRelocate,
      });
      if (res?.data?.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save applicant profile", err);
    } finally {
      setSaving(false);
    }
  };

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

      <section className="card">
        <div className="card-title">Application Profile</div>
        <p className="card-copy">
          Used to auto-fill job application forms when you use Auto Apply.
        </p>

        {loading ? (
          <div className="placeholder-card">Loading...</div>
        ) : (
          <form className="form-grid" onSubmit={handleSave}>
            <div className="form-field">
              <label>First Name</label>
              <input value={profile.firstName} onChange={handleChange("firstName")} />
            </div>
            <div className="form-field">
              <label>Last Name</label>
              <input value={profile.lastName} onChange={handleChange("lastName")} />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input value={profile.phone} onChange={handleChange("phone")} />
            </div>
            <div className="form-field">
              <label>Location</label>
              <input value={profile.location} onChange={handleChange("location")} />
            </div>
            <div className="form-field">
              <label>LinkedIn URL</label>
              <input value={profile.linkedinUrl} onChange={handleChange("linkedinUrl")} />
            </div>
            <div className="form-field">
              <label>Portfolio / Website URL</label>
              <input value={profile.portfolioUrl} onChange={handleChange("portfolioUrl")} />
            </div>
            <div className="form-field">
              <label>GitHub URL</label>
              <input value={profile.githubUrl} onChange={handleChange("githubUrl")} />
            </div>
            <div className="form-field">
              <label>Current Company</label>
              <input value={profile.currentCompany} onChange={handleChange("currentCompany")} />
            </div>
            <div className="form-field">
              <label>Work Authorization</label>
              <input
                value={profile.workAuthorization}
                onChange={handleChange("workAuthorization")}
                placeholder="e.g. Authorized to work in the US"
              />
            </div>
            <div className="form-field">
              <label>Notice Period</label>
              <input
                value={profile.noticePeriod}
                onChange={handleChange("noticePeriod")}
                placeholder="e.g. 2 weeks"
              />
            </div>
            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  checked={needsSponsorship}
                  onChange={(e) => setNeedsSponsorship(e.target.checked)}
                  style={{ width: "auto", marginRight: 8 }}
                />
                Requires visa sponsorship
              </label>
            </div>
            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  checked={willingToRelocate}
                  onChange={(e) => setWillingToRelocate(e.target.checked)}
                  style={{ width: "auto", marginRight: 8 }}
                />
                Willing to relocate
              </label>
            </div>
            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </button>
              {saved && <span className="status-message success">Saved.</span>}
            </div>
          </form>
        )}
      </section>
    </div>
  );
};
export default SettingsPage;
