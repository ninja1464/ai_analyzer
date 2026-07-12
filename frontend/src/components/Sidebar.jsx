import React from "react";
import {
  LayoutDashboard,
  FileSearch,
  Briefcase,
  History,
  FolderOpen,
  TrendingUp,
  PenTool,
  MessageSquare,
  Map,
  Bot,
  Settings,
  LogIn,
  UserPlus,
  Sparkles,
  Send,
  ListChecks,
} from "lucide-react";

const iconMap = {
  Dashboard: LayoutDashboard,
  "Resume Analysis": FileSearch,
  "Job Match": Briefcase,
  "Auto Apply": Send,
  "My Applications": ListChecks,
  "Resume History": History,
  Projects: FolderOpen,
  "Skill Gap": TrendingUp,
  "Resume Rewriter": PenTool,
  "Interview Questions": MessageSquare,
  "Career Roadmap": Map,
  "AI Chat": Bot,
  Settings: Settings,
  Login: LogIn,
  "Sign Up": UserPlus,
};

const Sidebar = ({ selectedPage, onChangePage, menuItems, user, onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Sparkles size={20} />
          <span className="brand-mark">ResumeAI</span>
        </div>
        <p className="brand-subtitle">Career dashboard</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = iconMap[item];
          return (
            <button
              key={item}
              type="button"
              className={item === selectedPage ? "nav-item active" : "nav-item"}
              onClick={() => onChangePage(item)}
            >
              {Icon && <Icon size={17} strokeWidth={2} className="nav-icon" />}
              <span>{item}</span>
            </button>
          );
        })}
      </nav>
      {user ? (
        <div className="sidebar-footer">
          <div className="user-summary">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button
            type="button"
            className="secondary-button logout-btn"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      ) : null}
    </aside>
  );
};

export default Sidebar;
