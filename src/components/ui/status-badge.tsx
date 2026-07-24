import * as React from "react";
import { STATUS_CONFIG } from "@/constants/design-system";
import { StatusVariant } from "@/types/design-system";
import { cn } from "@/lib/utils";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusVariant;
  customLabel?: string;
}

export function StatusBadge({ status, customLabel, className, ...props }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.neutral;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        config.color,
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", config.dotColor)} />
      <span>{customLabel || config.label}</span>
    </div>
  );
}
