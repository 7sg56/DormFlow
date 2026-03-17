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
        return <Plus className="h-12 w-12 text-primary" />;
      case "warning":
        return <AlertCircle className="h-12 w-12 text-yellow-500" />;
      case "search":
        return <Search className="h-12 w-12 text-muted-foreground" />;
      case "folder":
        return <FolderOpen className="h-12 w-12 text-muted-foreground" />;
      default:
        return <FileText className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const actionContent = actionLabel && (
    <div className="mt-6">
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
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="bg-muted/30 rounded-full p-6 mb-4">
          {getIcon()}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-sm mb-4">{description}</p>
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
