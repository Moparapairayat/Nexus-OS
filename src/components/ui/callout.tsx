import React from "react";
import { cn } from "@/lib/utils";

export interface CalloutProps {
  icon?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  variant?: "note" | "tip" | "important" | "warning" | "caution";
  className?: string;
}

export function Callout({ icon, title, children, variant = "note", className }: CalloutProps) {
  const borderStyles = {
    note: "border-l-blue-500 bg-blue-500/5",
    tip: "border-l-emerald-500 bg-emerald-500/5",
    important: "border-l-purple-500 bg-purple-500/5",
    warning: "border-l-amber-500 bg-amber-500/5",
    caution: "border-l-red-500 bg-red-500/5",
  };

  return (
    <div className={cn("rounded-r-xl border-l-4 p-4 text-xs font-normal border border-border/40 shadow-xs", borderStyles[variant], className)}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="shrink-0">{icon}</span>}
        {title && <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">{title}</span>}
      </div>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}
