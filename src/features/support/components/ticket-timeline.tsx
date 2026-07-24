"use client";

import React from "react";
import { TicketLog } from "@/types/support";
import { Clock, ShieldCheck, Tag, AlertCircle, ArrowUpRight, MessageSquare, Lock } from "lucide-react";

interface TicketTimelineProps {
  logs: TicketLog[];
}

export function TicketTimeline({ logs }: TicketTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
        No ticket timeline audit events recorded yet.
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "ticket_created":
        return <Clock className="h-3.5 w-3.5 text-blue-500" />;
      case "status_changed":
      case "ticket_resolved":
      case "ticket_closed":
        return <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />;
      case "priority_changed":
        return <AlertCircle className="h-3.5 w-3.5 text-rose-500" />;
      case "department_changed":
        return <Tag className="h-3.5 w-3.5 text-purple-500" />;
      case "internal_note_added":
        return <Lock className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
      {logs.map((log) => (
        <div key={log.id} className="relative flex items-start gap-2.5">
          <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border shadow-xs">
            {getIcon(log.eventType)}
          </div>
          <div className="flex-1 bg-muted/20 border border-border/50 p-2.5 rounded-xl text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground capitalize">
                {log.eventType.replace(/_/g, " ")}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-muted-foreground mt-0.5 text-[11px]">{log.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
