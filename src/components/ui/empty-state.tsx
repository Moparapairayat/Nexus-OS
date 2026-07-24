import * as React from "react";
import { LucideIcon, FolderOpen, SearchX, BellOff, Database, Activity, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export type EmptyStateVariant = "default" | "no-search" | "no-notifications" | "no-data" | "no-activity" | "no-files";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const PRESETS: Record<EmptyStateVariant, { icon: LucideIcon; title: string; description: string }> = {
  default: {
    icon: FolderOpen,
    title: "No Data Available",
    description: "There are currently no records or data to display.",
  },
  "no-search": {
    icon: SearchX,
    title: "No Search Results Found",
    description: "We couldn't find any matching records for your search query. Try broadening your keywords.",
  },
  "no-notifications": {
    icon: BellOff,
    title: "No Notifications",
    description: "You're all caught up! You have zero unread notifications or system alerts.",
  },
  "no-data": {
    icon: Database,
    title: "No Records Found",
    description: "No data has been created or provisioned in this category yet.",
  },
  "no-activity": {
    icon: Activity,
    title: "No Recent Activity",
    description: "System activity logs and event feeds will appear here as updates occur.",
  },
  "no-files": {
    icon: FileQuestion,
    title: "No Uploaded Files",
    description: "No documents, attachments, or exported files are linked to this record.",
  },
};

export function EmptyState({
  icon,
  variant = "default",
  title,
  description,
  actionLabel,
  onAction,
  className,
  ...props
}: EmptyStateProps) {
  const preset = PRESETS[variant] || PRESETS.default;
  const Icon = icon || preset.icon;
  const displayTitle = title || preset.title;
  const displayDescription = description || preset.description;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center glass-panel",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-3 shadow-inner">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{displayTitle}</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">{displayDescription}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
