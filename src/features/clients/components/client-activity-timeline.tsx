"use client";

import React from "react";
import { ClientActivity } from "@/types/client";
import { Timeline, TimelineEvent } from "@/components/ui/timeline";
import { User, ShieldAlert, FileText, Plus, CheckCircle2 } from "lucide-react";

interface ClientActivityTimelineProps {
  activities: ClientActivity[];
}

export function ClientActivityTimeline({ activities }: ClientActivityTimelineProps) {
  const getIcon = (type: ClientActivity["type"]) => {
    switch (type) {
      case "created":
        return <Plus className="h-3.5 w-3.5 text-blue-500" />;
      case "status_changed":
        return <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />;
      case "contact_added":
        return <User className="h-3.5 w-3.5 text-emerald-500" />;
      case "file_uploaded":
        return <FileText className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />;
    }
  };

  const timelineEvents: TimelineEvent[] = (activities || []).map((act) => ({
    id: act.id,
    title: act.title,
    description: act.description,
    timestamp: new Date(act.timestamp).toLocaleString(),
    icon: getIcon(act.type),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold tracking-tight">Audit & Activity Timeline</h3>
        <p className="text-xs text-muted-foreground">Comprehensive timestamped history of profile changes, contacts, and status updates.</p>
      </div>

      {timelineEvents.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">No recorded activity logs for this client profile.</p>
      ) : (
        <Timeline events={timelineEvents} />
      )}
    </div>
  );
}
