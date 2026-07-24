"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField, FormLabel } from "@/components/ui/form";
import { Tabs } from "@/components/ui/tabs";
import {
  getAdminCommunicationStatsAction,
  getAnnouncementsAction,
  createAnnouncementAction,
  getEmailLogsAction,
  getEmailTemplatesAction,
  sendSystemNotificationAction,
} from "@/features/notifications/actions/communication-actions";
import { getClientsAction } from "@/features/clients/actions/client-actions";
import {
  CommunicationStats,
  AnnouncementRecord,
  EmailLogRecord,
  EmailTemplateRecord,
} from "@/types/notification";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Mail,
  Bell,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  FileText,
  Eye,
  Users,
} from "lucide-react";

export default function AdminCommunicationDashboardPage() {
  const { toast, error: toastError } = useToast();
  const [stats, setStats] = useState<CommunicationStats>({
    totalEmailsSent: 0,
    failedEmails: 0,
    unreadNotifications: 0,
    activeAnnouncements: 0,
  });
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogRecord[]>([]);
  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Announcement Form State
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [annForm, setAnnForm] = useState({
    title: "",
    content: "",
    category: "announcement" as any,
    audience: "all" as any,
  });

  // Direct Notification Form State
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [notifForm, setNotifForm] = useState({
    clientId: "",
    title: "",
    message: "",
    category: "system" as any,
  });

  // Selected Email Template Preview
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateRecord | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [stRes, annRes, logRes, tmplRes, cliRes] = await Promise.all([
        getAdminCommunicationStatsAction(),
        getAnnouncementsAction(),
        getEmailLogsAction(),
        getEmailTemplatesAction(),
        getClientsAction(),
      ]);

      if (stRes.success && stRes.data) setStats(stRes.data.stats);
      if (annRes.success && annRes.data) setAnnouncements(annRes.data.announcements);
      if (logRes.success && logRes.data) setEmailLogs(logRes.data.emailLogs);
      if (tmplRes.success && tmplRes.data) {
        setTemplates(tmplRes.data.templates);
        if (tmplRes.data.templates.length > 0) setSelectedTemplate(tmplRes.data.templates[0]);
      }
      if (cliRes.success && cliRes.data) setClients(cliRes.data.clients);
    } catch (err) {
      console.error(err);
      toastError("Error", "Failed to load communication workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      const res = await createAnnouncementAction(annForm);
      if (res.success) {
        toast.success("Announcement Published!", { description: "Broadcast notice sent to all client portals." });
        setShowAnnForm(false);
        setAnnForm({ title: "", content: "", category: "announcement", audience: "all" });
        await fetchData();
      } else {
        toastError("Publishing Failed", res.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSendDirectNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.clientId || !notifForm.title) return;

    setIsSendingNotif(true);
    try {
      const res = await sendSystemNotificationAction({
        clientId: notifForm.clientId,
        title: notifForm.title,
        message: notifForm.message,
        category: notifForm.category,
      });
      if (res.success) {
        toast.success("Notification Dispatched!");
        setNotifForm({ clientId: "", title: "", message: "", category: "system" });
        await fetchData();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    } finally {
      setIsSendingNotif(false);
    }
  };

  const tabItems = [
    {
      id: "announcements",
      label: "Platform Announcements",
      content: (
        <div className="pt-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Active Platform Broadcasts</h3>
            <Button variant="glow" size="sm" onClick={() => setShowAnnForm(!showAnnForm)} className="text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Publish New Notice
            </Button>
          </div>

          {showAnnForm && (
            <Card variant="glass" className="p-4 space-y-3 border-primary/30">
              <h4 className="text-xs font-bold text-foreground">Create Announcement</h4>
              <form onSubmit={handlePublishAnnouncement} className="space-y-3">
                <FormField>
                  <FormLabel htmlFor="annTitle">Title *</FormLabel>
                  <Input
                    id="annTitle"
                    placeholder="e.g. Scheduled Infrastructure Maintenance - July 30"
                    value={annForm.title}
                    onChange={(e) => setAnnForm((p) => ({ ...p, title: e.target.value }))}
                    required
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="annContent">Notice Body *</FormLabel>
                  <Textarea
                    id="annContent"
                    placeholder="Provide details about the scheduled update or announcement..."
                    value={annForm.content}
                    onChange={(e) => setAnnForm((p) => ({ ...p, content: e.target.value }))}
                    rows={4}
                    required
                  />
                </FormField>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAnnForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="glow" size="sm" isLoading={isPublishing}>
                    Publish & Alert Clients
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-sm text-foreground">{ann.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(ann.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "emails",
      label: "Email Dispatch Audit Log",
      content: (
        <div className="pt-3 space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Recipient Email</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Template</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {emailLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-semibold text-foreground">{log.recipientEmail}</td>
                    <td className="p-3 text-muted-foreground">{log.subject}</td>
                    <td className="p-3 font-mono text-[11px]">{log.templateName}</td>
                    <td className="p-3">
                      <StatusBadge status={log.status === "sent" ? "success" : "error"} customLabel={log.status} />
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(log.sentAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: "templates",
      label: "Email Template Library",
      content: (
        <div className="pt-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-1 space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Active Templates</h4>
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedTemplate?.id === tmpl.id
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-muted/20 hover:bg-muted/50"
                }`}
              >
                <span className="font-bold text-xs text-foreground block">{tmpl.name}</span>
                <span className="text-[11px] text-muted-foreground font-mono">{tmpl.templateKey}</span>
              </div>
            ))}
          </div>

          <div className="col-span-1 lg:col-span-2">
            {selectedTemplate ? (
              <Card variant="glass" className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{selectedTemplate.name}</h4>
                    <span className="text-xs text-muted-foreground">Subject: {selectedTemplate.subjectTemplate}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/20 text-primary capitalize">
                    {selectedTemplate.category}
                  </span>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed border border-border/40">
                  {selectedTemplate.bodyTemplate}
                </div>
              </Card>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">Select a template to view.</div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "dispatcher",
      label: "Direct In-App Alert Dispatcher",
      content: (
        <div className="pt-3 max-w-xl">
          <Card variant="glass" className="p-5">
            <h4 className="text-xs font-bold text-foreground mb-3">Send Direct Notification to Client</h4>
            <form onSubmit={handleSendDirectNotif} className="space-y-3">
              <FormField>
                <FormLabel htmlFor="notifClient">Target Client Account *</FormLabel>
                <Select
                  id="notifClient"
                  value={notifForm.clientId}
                  onChange={(e) => setNotifForm((p) => ({ ...p, clientId: e.target.value }))}
                  options={[
                    { value: "", label: "Select client..." },
                    ...clients.map((c) => ({ value: c.id, label: `${c.companyName} (${c.primaryEmail})` })),
                  ]}
                  required
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="notifTitle">Title *</FormLabel>
                <Input
                  id="notifTitle"
                  placeholder="e.g. Action Required: Update Billing Address"
                  value={notifForm.title}
                  onChange={(e) => setNotifForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="notifMsg">Message Body *</FormLabel>
                <Textarea
                  id="notifMsg"
                  placeholder="Type notification alert message..."
                  value={notifForm.message}
                  onChange={(e) => setNotifForm((p) => ({ ...p, message: e.target.value }))}
                  rows={3}
                  required
                />
              </FormField>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="glow" size="sm" isLoading={isSendingNotif}>
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Dispatch Alert
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Communication Platform & Notification Engine"
        description="Manage broadcast announcements, email dispatch audit logs, email templates, and in-app alerts."
      />

      {/* KPI Stats */}
      <ResponsiveGrid cols={4}>
        <StatCard
          title="Total Emails Sent"
          value={String(stats.totalEmailsSent)}
          subtitle="All dispatches logged"
          icon={<Mail className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Failed Dispatches"
          value={String(stats.failedEmails)}
          subtitle="Delivery failures"
          icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
        />
        <StatCard
          title="Unread Alerts"
          value={String(stats.unreadNotifications)}
          subtitle="Client in-app notifications"
          icon={<Bell className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          title="Active Announcements"
          value={String(stats.activeAnnouncements)}
          subtitle="Published broadcasts"
          icon={<Megaphone className="h-4 w-4 text-amber-500" />}
        />
      </ResponsiveGrid>

      {/* Tabs */}
      <Card variant="glass" className="p-5">
        <Tabs items={tabItems} defaultTabId="announcements" />
      </Card>
    </PageContainer>
  );
}
