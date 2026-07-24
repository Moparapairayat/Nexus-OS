import React from "react";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: string;
}

export function Separator({
  className,
  orientation = "horizontal",
  label,
  ...props
}: SeparatorProps) {
  if (label && orientation === "horizontal") {
    return (
      <div className={cn("relative flex items-center my-4 w-full", className)} {...props}>
        <div className="flex-grow border-t border-border/60" />
        <span className="px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-background">
          {label}
        </span>
        <div className="flex-grow border-t border-border/60" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      className={cn(
        "shrink-0 bg-border/60",
        orientation === "horizontal" ? "h-[1px] w-full my-3" : "h-full w-[1px] mx-2 inline-block",
        className
      )}
      {...props}
    />
  );
}
