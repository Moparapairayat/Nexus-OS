import React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";

export interface ActivityItem {
  id: string;
  actor: {
    name: string;
    avatarUrl?: string | null;
  };
  action: string;
  target?: string;
  timeAgo: string;
}

export function ActivityFeed({ items, className }: { items: ActivityItem[]; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors">
          <Avatar src={item.actor.avatarUrl} alt={item.actor.name} size="sm" />
          <div className="flex-1 text-xs space-y-0.5">
            <p className="text-foreground">
              <span className="font-semibold">{item.actor.name}</span> {item.action}{" "}
              {item.target && <span className="font-medium text-primary">{item.target}</span>}
            </p>
            <span className="text-[10px] text-muted-foreground">{item.timeAgo}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
