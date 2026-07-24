import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  description?: string;
  icon?: React.ReactNode;
  status?: "completed" | "in_progress" | "pending";
}

export function Timeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  return (
    <div className={cn("relative space-y-4 pl-4 border-l border-border/60 ml-2", className)}>
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Node Icon/Dot */}
          <div className="absolute -left-[21px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border-2 border-primary text-primary shadow-xs">
            {event.icon || <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </div>

          <div className="flex flex-col space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground">{event.title}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{event.timestamp}</span>
            </div>
            {event.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
