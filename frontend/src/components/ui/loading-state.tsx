export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
        <p className="text-sm font-ui text-on-surface-variant">{message}</p>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-surface-container-high rounded-[var(--radius-sm)] animate-pulse-subtle" />
          <div className="h-3 w-3/4 bg-surface-container rounded-[var(--radius-sm)] animate-pulse-subtle" style={{ animationDelay: `${i * 150}ms` }} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="h-8 bg-surface-container-high rounded-[var(--radius)] animate-pulse-subtle w-full max-w-sm" />
      <div className="border border-outline-variant rounded-[var(--radius-lg)] overflow-hidden">
        <div className="p-3 space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-3">
              {Array.from({ length: cols }).map((_, j) => (
                <div key={j} className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-surface-container-high rounded-[var(--radius-sm)] animate-pulse-subtle" style={{ animationDelay: `${(i * cols + j) * 80}ms` }} />
                  <div className="h-3 w-2/3 bg-surface-container rounded-[var(--radius-sm)] animate-pulse-subtle" style={{ animationDelay: `${(i * cols + j) * 80 + 40}ms` }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
