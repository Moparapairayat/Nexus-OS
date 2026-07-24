import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  variant?: "default" | "success" | "warning" | "destructive";
}

export function Progress({ className, value, variant = "default", ...props }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const variantStyles = {
    default: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    destructive: "bg-destructive",
  };

  return (
    <div
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted/60", className)}
      {...props}
    >
      <div
        className={cn("h-full w-full flex-1 transition-all duration-300 ease-in-out", variantStyles[variant])}
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
    </div>
  );
}
