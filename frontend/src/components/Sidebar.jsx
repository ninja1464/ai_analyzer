import React from "react";

const menuItems = [
  "Dashboard",
  "Resume Analysis",
  "Job Match",
  "Sign Up",
  "Skill Gap",
  "Resume Rewriter",
  "Interview Questions",
  "Career Roadmap",
  "AI Chat",
  "Settings",
];

const Sidebar = ({ selectedPage, onChangePage, menuItems, user, onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">ResumeAI</span>
        <p className="brand-subtitle">Career dashboard</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
            className={item === selectedPage ? "nav-item active" : "nav-item"}
            onClick={() => onChangePage(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      {user ? (
        <div className="sidebar-footer">
          <div className="user-summary">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button type="button" className="secondary-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : null}
    </aside>
  );
};

export default Sidebar;
