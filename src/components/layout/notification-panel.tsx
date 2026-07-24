"use client";

import React, { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/ui/notification-item";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCheck, Bell } from "lucide-react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: "system" | "security" | "billing";
  type: "info" | "success" | "warning" | "error";
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "NexusOS Enterprise System Live",
    message: "The enterprise navigation architecture and operations control center are fully active.",
    timestamp: "2 mins ago",
    category: "system",
    type: "success",
    unread: true,
  },
  {
    id: "n2",
    title: "Security Shield Enforcement",
    message: "Role-based privilege escalation prevention and rate-limiting active across all endpoints.",
    timestamp: "1 hour ago",
    category: "security",
    type: "info",
    unread: true,
  },
  {
    id: "n3",
    title: "Database Backup Completed",
    message: "Automated snapshot of Supabase PostgreSQL schema and profiles executed cleanly.",
    timestamp: "3 hours ago",
    category: "system",
    type: "info",
    unread: false,
  },
  {
    id: "n4",
    title: "Payment Gateway Connection Ready",
    message: "UddoktaPay payment gateway active for automated online checkouts and IPN webhooks.",
    timestamp: "1 day ago",
    category: "billing",
    type: "success",
    unread: false,
  },
];

export interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleItem = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (unreadOnly && !n.unread) return false;
    if (activeCategory !== "all" && n.category !== activeCategory) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Center"
      description={`You have ${unreadCount} unread system notifications`}
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Controls & Actions */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {["all", "system", "security", "billing"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`capitalize px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground shrink-0"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5 text-primary" /> Mark all read
            </Button>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between text-xs px-1">
          <label className="flex items-center gap-2 cursor-pointer text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-input text-primary"
            />
            Show unread only
          </label>
          <span className="text-[11px] text-muted-foreground font-mono">
            {filteredNotifications.length} items
          </span>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredNotifications.length === 0 ? (
            <EmptyState variant="no-notifications" className="my-8" />
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                id={notification.id}
                title={notification.title}
                message={notification.message}
                timestamp={notification.timestamp}
                type={notification.type}
                unread={notification.unread}
                onClick={() => handleToggleItem(notification.id)}
              />
            ))
          )}
        </div>
      </div>
    </Sheet>
  );
}
