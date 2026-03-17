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
      className={`relative z-50 min-w-[8rem] overflow-hidden ${align === "center" ? "left-1/2 -translate-x-1/2" :
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
      className={`cursor-pointer px-2 py-1.5 text-sm hover:bg-muted rounded-sm ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2 py-1.5 text-sm font-semibold">{children}</div>;
}

export function DropdownMenuSeparator() {
  return <div className="h-px my-2 border-t border-border" />;
}

export function DropdownMenuShortcut({ children }: { children?: React.ReactNode }) {
  return <span className="ml-auto text-xs tracking-widest opacity-60">{children}</span>;
}
