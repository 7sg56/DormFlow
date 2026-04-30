import { Button } from "./button";
import { Plus, FolderOpen, FileText, Search, AlertCircle } from "lucide-react";

export interface EmptyStateProps {
  icon?: "success" | "warning" | "info" | "search" | "folder";
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
}

export function EmptyState({
  icon = "info",
  title,
  description,
  actionLabel,
  onAction,
  href,
}: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case "success":
        return <Plus className="h-10 w-10 text-primary" />;
      case "warning":
        return <AlertCircle className="h-10 w-10 text-warning" />;
      case "search":
        return <Search className="h-10 w-10 text-outline" />;
      case "folder":
        return <FolderOpen className="h-10 w-10 text-outline" />;
      default:
        return <FileText className="h-10 w-10 text-outline" />;
    }
  };

  const actionContent = actionLabel && (
    <div className="mt-5">
      {href ? (
        <Button asChild variant="default">
          <a href={href}>{actionLabel}</a>
        </Button>
      ) : onAction ? (
        <Button onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </div>
  );

  return (
    <div className="flex min-h-[360px] items-center justify-center p-8">
      <div className="flex flex-col items-center max-w-sm text-center">
        <div className="bg-surface-container rounded-full p-5 mb-4">
          {getIcon()}
        </div>
        <h3 className="font-headline text-base font-semibold text-on-surface mb-1.5">{title}</h3>
        {description && (
          <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
        )}
        {actionContent}
      </div>
    </div>
  );
}

export function NoDataFound({ entity = "data" }: { entity?: string }) {
  return (
    <EmptyState
      icon="search"
      title={`No ${entity} found`}
      description={`There are no ${entity.toLowerCase()} available at this time.`}
    />
  );
}

export function NoAccess({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <EmptyState
      icon="warning"
      title="Access Denied"
      description="You don't have permission to view this page."
      actionLabel="Go to Dashboard"
      onAction={onGoHome}
    />
  );
}
