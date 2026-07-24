import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface BannerProps {
  children: React.ReactNode;
  variant?: "primary" | "warning" | "info" | "success";
  onDismiss?: () => void;
  className?: string;
}

export function Banner({ children, variant = "primary", onDismiss, className }: BannerProps) {
  const variantStyles = {
    primary: "bg-primary text-primary-foreground",
    warning: "bg-amber-500 text-white dark:text-black",
    info: "bg-blue-600 text-white",
    success: "bg-emerald-600 text-white",
  };

  return (
    <div className={cn("relative flex items-center justify-between gap-4 px-4 py-2 text-xs font-medium shadow-xs", variantStyles[variant], className)}>
      <div className="flex-1 text-center truncate">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Dismiss banner</span>
        </button>
      )}
    </div>
  );
}
