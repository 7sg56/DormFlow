import * as React from "react";

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
}

export interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <div className="relative inline-block">{children}</div>;
}

export function DropdownMenuTrigger({ children, ...props }: DropdownMenuProps & Record<string, unknown>) {
  return <div {...props}>{children}</div>;
}

export function DropdownMenuContent({ align = "start", children }: DropdownMenuContentProps) {
  return (
    <div
      className={`relative z-50 min-w-[8rem] overflow-hidden rounded-[var(--radius-md)] border border-outline-variant bg-card shadow-[var(--shadow-md)] ${align === "center" ? "left-1/2 -translate-x-1/2" :
          align === "end" ? "right-1/2 translate-x-1/2" :
            ""
        }`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className = "" }: DropdownMenuItemProps) {
  return (
    <div
      className={`cursor-pointer px-3 py-2 font-ui text-sm text-on-surface hover:bg-surface-container-high rounded-[var(--radius-sm)] transition-colors ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-3 py-2 label-md text-on-surface-variant">{children}</div>;
}

export function DropdownMenuSeparator() {
  return <div className="h-px my-1 bg-outline-variant" />;
}

export function DropdownMenuShortcut({ children }: { children?: React.ReactNode }) {
  return <span className="ml-auto text-xs tracking-widest text-outline">{children}</span>;
}
