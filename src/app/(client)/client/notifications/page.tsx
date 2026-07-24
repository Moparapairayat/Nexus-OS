"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClientNotification, NotificationCategory } from "@/types/notification";
import {
  getClientNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/features/notifications/actions/communication-actions";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  BellOff,
  CreditCard,
  MessageSquare,
  RefreshCw,
  Settings,
  User,
  Megaphone,
  CheckCheck,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  billing: { icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  invoices: { icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  payments: { icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  support: { icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  renewal: { icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  renewals: { icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  announcements: { icon: Megaphone, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  system: { icon: Settings, color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
  account: { icon: User, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

type Filter = "all" | string;

export default function ClientNotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setIsLoading(true);
    try {
      const res = await getClientNotificationsAction();
      if (res.success && res.data) setNotifications(res.data.notifications);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    await markNotificationReadAction(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "read" as const } : n))
    );
  }

  async function handleMarkAllRead() {
    setIsMarking(true);
    try {
      await markAllNotificationsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" as const })));
      toast.success("All notifications marked as read.");
    } finally {
      setIsMarking(false);
    }
  }

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.category.startsWith(filter));
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "billing", label: "Billing" },
    { key: "support", label: "Support" },
    { key: "renewal", label: "Renewals" },
    { key: "announcements", label: "Announcements" },
    { key: "system", label: "System" },
  ];

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Notification Center"
        description="Stay updated on invoices, service renewals, support replies, and platform announcements."
        badge={unreadCount > 0 ? (
          <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[11px]">
            {unreadCount} Unread
          </Badge>
        ) : undefined}
      />

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Filter Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              {f.key === "all" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-rose-500 text-white text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleMarkAllRead}
            isLoading={isMarking}
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const cfg = CATEGORY_CONFIG[notif.category] || CATEGORY_CONFIG.system;
            const isUnread = notif.status === "unread";

            return (
              <Card
                key={notif.id}
                variant="glass"
                className={`p-4 flex items-start gap-3 transition-all cursor-pointer group ${
                  isUnread ? "border-primary/20 bg-primary/5" : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => isUnread && handleMarkRead(notif.id)}
              >
                {/* Icon */}
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 ${cfg.bg}`}>
                  <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-xs font-semibold ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                        {notif.title}
                        {isUnread && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-semibold text-primary flex items-center gap-1 hover:underline"
                      >
                        {notif.actionLabel || "View"} <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border/60 rounded-xl">
              <BellOff className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No notifications found</p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
