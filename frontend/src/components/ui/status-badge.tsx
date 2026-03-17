import { CheckCircle2, Clock, AlertTriangle, XCircle, Loader2 } from "lucide-react";

export type Status = "success" | "pending" | "warning" | "error" | "info" | "loading" | "in-progress" | "open" | "resolved" | "scheduled" | "cancelled" | "active" | "inactive";

export interface StatusBadgeProps {
  status: Status;
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, text, size = "sm" }: StatusBadgeProps) {
  const config = {
    success: {
      bgClass: "bg-green-100 dark:bg-green-900/30",
      textClass: "text-green-700 dark:text-green-400",
      icon: <CheckCircle2 className="h-3 w-3" />,
      defaultText: "Completed",
    },
    pending: {
      bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
      textClass: "text-yellow-700 dark:text-yellow-400",
      icon: <Clock className="h-3 w-3" />,
      defaultText: "Pending",
    },
    warning: {
      bgClass: "bg-orange-100 dark:bg-orange-900/30",
      textClass: "text-orange-700 dark:text-orange-400",
      icon: <AlertTriangle className="h-3 w-3" />,
      defaultText: "Warning",
    },
    error: {
      bgClass: "bg-red-100 dark:bg-red-900/30",
      textClass: "text-red-700 dark:text-red-400",
      icon: <XCircle className="h-3 w-3" />,
      defaultText: "Error",
    },
    info: {
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
      textClass: "text-blue-700 dark:text-blue-400",
      icon: <Clock className="h-3 w-3" />,
      defaultText: "Info",
    },
    loading: {
      bgClass: "bg-gray-100 dark:bg-gray-800/30",
      textClass: "text-gray-700 dark:text-gray-400",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      defaultText: "Loading",
    },
    "in-progress": {
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
      textClass: "text-blue-700 dark:text-blue-400",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      defaultText: "In Progress",
    },
    open: {
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
      textClass: "text-blue-700 dark:text-blue-400",
      icon: <Clock className="h-3 w-3" />,
      defaultText: "Open",
    },
    resolved: {
      bgClass: "bg-green-100 dark:bg-green-900/30",
      textClass: "text-green-700 dark:text-green-400",
      icon: <CheckCircle2 className="h-3 w-3" />,
      defaultText: "Resolved",
    },
    scheduled: {
      bgClass: "bg-purple-100 dark:bg-purple-900/30",
      textClass: "text-purple-700 dark:text-purple-400",
      icon: <Clock className="h-3 w-3" />,
      defaultText: "Scheduled",
    },
    cancelled: {
      bgClass: "bg-red-100 dark:bg-red-900/30",
      textClass: "text-red-700 dark:text-red-400",
      icon: <XCircle className="h-3 w-3" />,
      defaultText: "Cancelled",
    },
    active: {
      bgClass: "bg-green-100 dark:bg-green-900/30",
      textClass: "text-green-700 dark:text-green-400",
      icon: <CheckCircle2 className="h-3 w-3" />,
      defaultText: "Active",
    },
    inactive: {
      bgClass: "bg-gray-100 dark:bg-gray-800/30",
      textClass: "text-gray-700 dark:text-gray-400",
      icon: <XCircle className="h-3 w-3" />,
      defaultText: "Inactive",
    },
  };

  const currentConfig = config[status] || config.info;
  const displayText = text || currentConfig.defaultText;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${currentConfig.bgClass} ${currentConfig.textClass}`}
    >
      {currentConfig.icon}
      <span className="capitalize">{displayText}</span>
    </span>
  );
}

export function ComplaintStatusBadge({ status, text }: { status: "Open" | "In Progress" | "Resolved" | "Closed"; text?: string }) {
  const statusMap: Record<string, Status> = {
    "Open": "open",
    "In Progress": "in-progress",
    "Resolved": "resolved",
    "Closed": "success",
  };
  return <StatusBadge status={statusMap[status] || "open"} text={text} />;
}

export function MaintenanceStatusBadge({ status, text }: { status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"; text?: string }) {
  const statusMap: Record<string, Status> = {
    "Scheduled": "scheduled",
    "In Progress": "in-progress",
    "Completed": "success",
    "Cancelled": "cancelled",
  };
  return <StatusBadge status={statusMap[status] || "scheduled"} text={text} />;
}

export function FeeStatusBadge({ status, text }: { status: "Paid" | "Pending" | "Overdue" | "Partial"; text?: string }) {
  const statusMap: Record<string, Status> = {
    "Paid": "success",
    "Pending": "pending",
    "Overdue": "error",
    "Partial": "warning",
  };
  return <StatusBadge status={statusMap[status] || "pending"} text={text} />;
}

export function FacilityBookingStatusBadge({ status, text }: { status: "Confirmed" | "Pending" | "Cancelled" | "Completed"; text?: string }) {
  const statusMap: Record<string, Status> = {
    "Confirmed": "success",
    "Pending": "pending",
    "Cancelled": "cancelled",
    "Completed": "success",
  };
  return <StatusBadge status={statusMap[status] || "pending"} text={text} />;
}
