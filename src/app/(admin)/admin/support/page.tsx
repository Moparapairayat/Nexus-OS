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
import { Sheet } from "@/components/ui/sheet";
import { Tabs } from "@/components/ui/tabs";
import { TicketConversation } from "@/features/support/components/ticket-conversation";
import { TicketTimeline } from "@/features/support/components/ticket-timeline";
import {
  getSupportTicketsAction,
  getTicketDetailsAction,
  addTicketMessageAction,
  updateTicketStatusAction,
  updateTicketPriorityAction,
  updateTicketDepartmentAction,
} from "@/features/support/actions/support-actions";
import {
  SupportTicket,
  TicketDepartment,
  TicketPriority,
  TicketStatus,
  TicketFilters,
  TicketLog,
} from "@/types/support";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";
import { useToast } from "@/hooks/use-toast";
import {
  HelpCircle,
  Search,
  Filter,
  RefreshCw,
  Send,
  Lock,
  MessageSquare,
  ShieldAlert,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building2,
  Package,
} from "lucide-react";

export default function AdminSupportWorkspacePage() {
  const { toast, error: toastError } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TicketFilters>({
    search: "",
    department: "all",
    priority: "all",
    status: "all",
  });

  // Active Ticket Drawer State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [activeService, setActiveService] = useState<any>(null);
  const [activeClient, setActiveClient] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Reply Form State
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await getSupportTicketsAction(filters);
      if (res.success && res.data) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      toastError("Error", "Failed to load support workspace tickets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  // Realtime live chat & ticket status subscriptions
  useRealtimeSubscription({
    table: "ticket_messages",
    event: "INSERT",
    onPayload: async (payload) => {
      if (selectedTicketId && payload.new?.ticket_id === selectedTicketId) {
        const res = await getTicketDetailsAction(selectedTicketId);
        if (res.success && res.data) {
          setActiveTicket(res.data.ticket);
          setActiveService((res.data as any).service || null);
          setActiveClient((res.data as any).client || null);
        }
      }
    },
    enabled: !!selectedTicketId,
  });

  useRealtimeSubscription({
    table: "support_tickets",
    event: "*",
    onPayload: () => {
      fetchTickets();
    },
  });

  const handleInspectTicket = async (id: string) => {
    setSelectedTicketId(id);
    setIsDetailLoading(true);
    try {
      const res = await getTicketDetailsAction(id);
      if (res.success && res.data) {
        setActiveTicket(res.data.ticket);
        setActiveService((res.data as any).service || null);
        setActiveClient((res.data as any).client || null);
      }
    } catch (err) {
      toastError("Error", "Failed to load ticket details.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyMessage.trim()) return;

    setIsReplying(true);
    try {
      const res = await addTicketMessageAction(selectedTicketId, replyMessage, isInternalNote);
      if (res.success) {
        setReplyMessage("");
        toast.success(isInternalNote ? "Internal Note Saved!" : "Reply Sent!");
        await handleInspectTicket(selectedTicketId);
        await fetchTickets();
      } else {
        toastError("Posting Failed", res.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message || "Failed to post message.");
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!selectedTicketId) return;
    setIsActionLoading(true);
    try {
      const res = await updateTicketStatusAction(selectedTicketId, status);
      if (res.success) {
        toast.success("Status Updated", { description: `Status changed to ${status}.` });
        await handleInspectTicket(selectedTicketId);
        await fetchTickets();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    if (!selectedTicketId) return;
    setIsActionLoading(true);
    try {
      const res = await updateTicketPriorityAction(selectedTicketId, priority);
      if (res.success) {
        toast.success("Priority Escalated", { description: `Priority changed to ${priority}.` });
        await handleInspectTicket(selectedTicketId);
        await fetchTickets();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDepartmentChange = async (department: TicketDepartment) => {
    if (!selectedTicketId) return;
    setIsActionLoading(true);
    try {
      const res = await updateTicketDepartmentAction(selectedTicketId, department);
      if (res.success) {
        toast.success("Re-routed Department", { description: `Moved to ${department}.` });
        await handleInspectTicket(selectedTicketId);
        await fetchTickets();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const openCount = tickets.filter((t) => t.status === "open" || t.status === "waiting_staff").length;
  const urgentCount = tickets.filter((t) => t.priority === "high" || t.priority === "urgent" || t.priority === "critical").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  const tabItems = activeTicket
    ? [
        {
          id: "feed",
          label: "Conversation & Replies",
          content: (
            <div className="pt-3 space-y-4">
              <TicketConversation replies={activeTicket.replies} isStaffView={true} />

              {/* Reply / Internal Note Form */}
              <form onSubmit={handlePostReply} className="space-y-3 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Post Message</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        !isInternalNote ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Public Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                        isInternalNote ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Lock className="h-3 w-3" /> Internal Staff Note
                    </button>
                  </div>
                </div>

                <Textarea
                  placeholder={
                    isInternalNote
                      ? "Write staff internal note (only visible to support team)..."
                      : "Type public response to client..."
                  }
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={3}
                  className={isInternalNote ? "border-amber-500/50 bg-amber-500/5" : ""}
                  required
                />

                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    variant={isInternalNote ? "glow" : "glow"}
                    size="sm"
                    isLoading={isReplying}
                    className={`text-xs gap-1.5 ${isInternalNote ? "bg-amber-600 hover:bg-amber-500 text-white" : ""}`}
                  >
                    {isInternalNote ? <Lock className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                    {isInternalNote ? "Save Staff Note" : "Send Public Reply"}
                  </Button>
                </div>
              </form>
            </div>
          ),
        },
        {
          id: "context",
          label: "Customer & Asset Context",
          content: (
            <div className="pt-3 space-y-4">
              {/* Organization Info */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Building2 className="h-4 w-4" />
                  <span>{activeTicket.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Contact:</span>
                  <span className="font-semibold text-foreground">{activeTicket.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email Address:</span>
                  <span className="font-semibold text-foreground">{activeTicket.clientEmail}</span>
                </div>
              </div>

              {/* Linked Service */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-500 font-bold">
                  <Package className="h-4 w-4" />
                  <span>Linked Digital Service</span>
                </div>
                <p className="font-semibold text-foreground">{activeTicket.serviceName || "No specific service linked"}</p>
              </div>
            </div>
          ),
        },
        {
          id: "timeline",
          label: "Audit Timeline",
          content: (
            <div className="pt-3 space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Ticket Event Log</h4>
              <TicketTimeline logs={activeTicket.logs || []} />
            </div>
          ),
        },
      ]
    : [];

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Enterprise Support Center & Ticket Workspace"
        description="Multi-department routing, priority escalations, staff internal notes, and SLA tracking."
      />

      {/* KPI Stats */}
      <ResponsiveGrid cols={4}>
        <StatCard
          title="Unresolved Tickets"
          value={String(openCount)}
          subtitle="Waiting for staff or client"
          icon={<MessageSquare className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          title="Urgent Escalations"
          value={String(urgentCount)}
          subtitle="High priority SLA"
          icon={<ShieldAlert className="h-4 w-4 text-rose-500" />}
        />
        <StatCard
          title="Resolved Tickets"
          value={String(resolvedCount)}
          subtitle="Successfully closed"
          icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Average Response"
          value="8 Mins"
          subtitle="First response SLA"
          icon={<Clock className="h-4 w-4 text-blue-500" />}
        />
      </ResponsiveGrid>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/80 glass-panel">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tickets by number (TKT-2026-001), subject, or client..."
              value={filters.search || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0">
          <Select
            value={filters.department || "all"}
            onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value as any }))}
            options={[
              { value: "all", label: "All Departments" },
              { value: "technical", label: "Technical" },
              { value: "billing", label: "Billing" },
              { value: "hosting", label: "Hosting" },
              { value: "cloudflare", label: "Cloudflare" },
              { value: "domains", label: "Domains" },
              { value: "security", label: "Security" },
            ]}
          />

          <Button variant="outline" size="sm" onClick={fetchTickets} className="h-9 text-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Directory Table */}
      <Card variant="glass" className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No support tickets match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Ticket #</th>
                  <th className="p-3">Client / Organization</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Updated</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {tickets.map((tkt) => (
                  <tr key={tkt.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{tkt.ticketNumber}</td>
                    <td className="p-3">
                      <span className="font-bold text-foreground block">{tkt.companyName}</span>
                      <span className="text-muted-foreground text-[11px]">{tkt.clientName}</span>
                    </td>
                    <td className="p-3 font-medium text-foreground max-w-[200px] truncate">{tkt.subject}</td>
                    <td className="p-3 capitalize text-muted-foreground font-semibold">{tkt.department}</td>
                    <td className="p-3 capitalize font-bold">
                      <span className={tkt.priority === "urgent" || tkt.priority === "critical" ? "text-rose-500" : "text-foreground"}>
                        {tkt.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={tkt.status as any} />
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(tkt.updatedAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInspectTicket(tkt.id)}
                        className="h-7 text-xs px-2.5"
                      >
                        Inspect & Reply
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Ticket Inspector Drawer */}
      <Sheet
        isOpen={Boolean(selectedTicketId)}
        onClose={() => setSelectedTicketId(null)}
        title={activeTicket ? `Ticket ${activeTicket.ticketNumber}` : "Support Inspector"}
        description={activeTicket?.subject || "Enterprise Support Workspace"}
      >
        {isDetailLoading || !activeTicket ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-5 pt-2 pb-6">
            {/* Quick Action Controls Bar */}
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 grid grid-cols-2 gap-2 text-xs">
              <div>
                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Status</FormLabel>
                <Select
                  value={activeTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  options={[
                    { value: "open", label: "Open" },
                    { value: "waiting_staff", label: "Waiting Staff" },
                    { value: "waiting_client", label: "Waiting Client" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "resolved", label: "Resolved" },
                    { value: "closed", label: "Closed" },
                  ]}
                  disabled={isActionLoading}
                />
              </div>

              <div>
                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Priority</FormLabel>
                <Select
                  value={activeTicket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                  options={[
                    { value: "low", label: "Low" },
                    { value: "normal", label: "Normal" },
                    { value: "high", label: "High" },
                    { value: "urgent", label: "Urgent" },
                    { value: "critical", label: "Critical" },
                  ]}
                  disabled={isActionLoading}
                />
              </div>
            </div>

            {/* Tabs Inspector */}
            <Tabs items={tabItems} defaultTabId="feed" />
          </div>
        )}
      </Sheet>
    </PageContainer>
  );
}
