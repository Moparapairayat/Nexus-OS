import React from "react";
import { cn } from "@/lib/utils";
import { Bell, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread?: boolean;
  type?: "info" | "success" | "warning" | "error";
  onClick?: () => void;
  className?: string;
}

export function NotificationItem({
  title,
  message,
  timestamp,
  unread = false,
  type = "info",
  onClick,
  className,
}: NotificationItemProps) {
  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "warning"
      ? AlertTriangle
      : type === "error"
      ? AlertCircle
      : Info;

  const iconColors = {
    info: "text-blue-500 bg-blue-500/10",
    success: "text-emerald-500 bg-emerald-500/10",
    warning: "text-amber-500 bg-amber-500/10",
    error: "text-destructive bg-destructive/10",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/40 transition-all cursor-pointer",
        unread && "bg-primary/5 border-primary/20",
        className
      )}
    >
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5", iconColors[type])}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <h6 className={cn("text-xs font-semibold truncate", unread ? "text-foreground font-bold" : "text-foreground/90")}>
            {title}
          </h6>
          <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{timestamp}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">{message}</p>
      </div>

      {unread && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
    </div>
  );
}
