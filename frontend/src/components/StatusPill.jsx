import React from "react";
import { CheckCircle2, Clock, AlertTriangle, FileEdit } from "lucide-react";

export const STATUS_META = {
  submitted: { label: "Submitted", icon: CheckCircle2, className: "status-submitted" },
  ready_for_review: {
    label: "Ready for your review",
    icon: Clock,
    className: "status-ready_for_review",
  },
  awaiting_manual_step: {
    label: "Waiting on you",
    icon: AlertTriangle,
    className: "status-awaiting_manual_step",
  },
  failed: { label: "Failed", icon: AlertTriangle, className: "status-failed" },
  draft: { label: "Manual apply needed", icon: FileEdit, className: "status-draft" },
};

const StatusPill = ({ status }) => {
  const meta = STATUS_META[status] || { label: status, icon: Clock, className: "status-draft" };
  const Icon = meta.icon;
  return (
    <span className={`status-pill ${meta.className}`}>
      <Icon size={14} /> {meta.label}
    </span>
  );
};

export default StatusPill;
