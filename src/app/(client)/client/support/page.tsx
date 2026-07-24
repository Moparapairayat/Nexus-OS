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
import { TicketConversation } from "@/features/support/components/ticket-conversation";
import {
  getSupportTicketsAction,
  getTicketDetailsAction,
  createSupportTicketAction,
  addTicketMessageAction,
  updateTicketStatusAction,
} from "@/features/support/actions/support-actions";
import { getClientServicesAction } from "@/features/services/actions/service-actions";
import { SupportTicket, TicketDepartment, TicketPriority, TicketStatus } from "@/types/support";
import { ClientService } from "@/types/service";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Send,
  HelpCircle,
  ShieldCheck,
  Tag,
  Paperclip,
} from "lucide-react";

export default function ClientSupportPage() {
  const { toast, error: toastError } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [services, setServices] = useState<ClientService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Ticket Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    subject: "",
    description: "",
    department: "technical" as TicketDepartment,
    priority: "normal" as TicketPriority,
    serviceId: "",
  });

  // Active Ticket Drawer State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tktRes, srvRes] = await Promise.all([
        getSupportTicketsAction(),
        getClientServicesAction(),
      ]);

      if (tktRes.success && tktRes.data) setTickets(tktRes.data.tickets);
      if (srvRes.success && srvRes.data) setServices(srvRes.data.services);
    } catch (err) {
      toastError("Error", "Failed to load support tickets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenTicket = async (id: string) => {
    setSelectedTicketId(id);
    setIsDetailLoading(true);
    try {
      const res = await getTicketDetailsAction(id);
      if (res.success && res.data) {
        setActiveTicket(res.data.ticket);
      }
    } catch (err) {
      toastError("Error", "Failed to load ticket details.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await createSupportTicketAction(createForm);
      if (res.success && res.data) {
        toast.success("Ticket Submitted!", {
          description: `Ticket ${res.data.ticketNumber} opened. Our team will respond shortly.`,
        });
        setShowCreateModal(false);
        setCreateForm({
          subject: "",
          description: "",
          department: "technical",
          priority: "normal",
          serviceId: "",
        });
        await fetchData();
      } else {
        toastError("Submission Failed", res.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message || "An error occurred.");
    } finally {
      setIsCreating(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyMessage.trim()) return;

    setIsReplying(true);
    try {
      const res = await addTicketMessageAction(selectedTicketId, replyMessage, false);
      if (res.success) {
        setReplyMessage("");
        toast.success("Reply Posted!");
        await handleOpenTicket(selectedTicketId);
        await fetchData();
      } else {
        toastError("Reply Failed", res.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message || "Failed to post reply.");
    } finally {
      setIsReplying(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicketId) return;
    try {
      const res = await updateTicketStatusAction(selectedTicketId, "closed");
      if (res.success) {
        toast.success("Ticket Closed");
        await handleOpenTicket(selectedTicketId);
        await fetchData();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    }
  };

  const openTicketsCount = tickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length;
  const resolvedTicketsCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="24/7 Enterprise Support Workspace"
        description="Submit tickets, communicate with technical engineers, and view resolution timelines."
        badge={<StatusBadge status="active" customLabel="Support SLA Active" />}
      />

      {/* KPI Stats */}
      <ResponsiveGrid cols={3}>
        <StatCard
          title="Open Tickets"
          value={String(openTicketsCount)}
          subtitle="Awaiting response / in progress"
          icon={<MessageSquare className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          title="Resolved Tickets"
          value={String(resolvedTicketsCount)}
          subtitle="Closed & settled"
          icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Guaranteed SLA"
          value="< 15 Mins"
          subtitle="Priority response time"
          icon={<ShieldCheck className="h-4 w-4 text-blue-500" />}
        />
      </ResponsiveGrid>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/80 glass-panel">
        <h3 className="font-bold text-sm text-foreground">Ticket History ({tickets.length})</h3>
        <Button variant="glow" size="sm" onClick={() => setShowCreateModal(true)} className="text-xs">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Raise New Ticket
        </Button>
      </div>

      {/* Tickets Directory */}
      <Card variant="glass" className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No support tickets created yet. Click "Raise New Ticket" to contact support.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {tickets.map((tkt) => (
              <div
                key={tkt.id}
                onClick={() => handleOpenTicket(tkt.id)}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 shrink-0 mt-0.5">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-primary">{tkt.ticketNumber}</span>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {tkt.subject}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {tkt.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                      <span className="capitalize font-semibold text-foreground">{tkt.department}</span>
                      <span>&bull;</span>
                      <span>Updated {new Date(tkt.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={tkt.status as any} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Ticket Sheet */}
      <Sheet
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Raise Support Ticket"
        description="Submit your request to our enterprise support desk."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2 pb-6">
          <FormField>
            <FormLabel htmlFor="subject">Subject / Issue Summary *</FormLabel>
            <Input
              id="subject"
              placeholder="e.g. Domain SSL renewal not showing in panel"
              value={createForm.subject}
              onChange={(e) => setCreateForm((p) => ({ ...p, subject: e.target.value }))}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField>
              <FormLabel htmlFor="department">Department *</FormLabel>
              <Select
                id="department"
                value={createForm.department}
                onChange={(e) => setCreateForm((p) => ({ ...p, department: e.target.value as TicketDepartment }))}
                options={[
                  { value: "technical", label: "Technical Support" },
                  { value: "billing", label: "Billing & Invoices" },
                  { value: "hosting", label: "Hosting & Server" },
                  { value: "cloudflare", label: "Cloudflare & Security" },
                  { value: "domains", label: "Domains & DNS" },
                  { value: "development", label: "Development & Retainer" },
                  { value: "general", label: "General Inquiry" },
                ]}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="priority">Priority Level</FormLabel>
              <Select
                id="priority"
                value={createForm.priority}
                onChange={(e) => setCreateForm((p) => ({ ...p, priority: e.target.value as TicketPriority }))}
                options={[
                  { value: "low", label: "Low" },
                  { value: "normal", label: "Normal" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />
            </FormField>
          </div>

          {services.length > 0 && (
            <FormField>
              <FormLabel htmlFor="serviceId">Related Service (Optional)</FormLabel>
              <Select
                id="serviceId"
                value={createForm.serviceId}
                onChange={(e) => setCreateForm((p) => ({ ...p, serviceId: e.target.value }))}
                options={[
                  { value: "", label: "General / Unrelated" },
                  ...services.map((s) => ({ value: s.id, label: s.customName })),
                ]}
              />
            </FormField>
          )}

          <FormField>
            <FormLabel htmlFor="description">Detailed Description *</FormLabel>
            <Textarea
              id="description"
              placeholder="Describe the issue, error messages, steps to reproduce, or requirements..."
              value={createForm.description}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
              rows={5}
              required
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" size="sm" isLoading={isCreating}>
              Submit Ticket
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Ticket Details & Conversation Drawer */}
      <Sheet
        isOpen={Boolean(selectedTicketId)}
        onClose={() => setSelectedTicketId(null)}
        title={activeTicket ? `Ticket ${activeTicket.ticketNumber}` : "Ticket Inspector"}
        description={activeTicket?.subject || "Support thread"}
      >
        {isDetailLoading || !activeTicket ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6 pt-2 pb-6">
            {/* Header Meta */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Department: {activeTicket.department}
                </span>
                <span className="font-bold text-sm text-foreground">{activeTicket.subject}</span>
              </div>
              <StatusBadge status={activeTicket.status as any} />
            </div>

            {/* Conversation Feed */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Conversation Feed</h4>
              <TicketConversation replies={activeTicket.replies} isStaffView={false} />
            </div>

            {/* Reply Editor */}
            {activeTicket.status !== "closed" && (
              <form onSubmit={handlePostReply} className="space-y-3 pt-4 border-t border-border/60">
                <FormField>
                  <FormLabel htmlFor="reply">Post Reply</FormLabel>
                  <Textarea
                    id="reply"
                    placeholder="Type your response to support staff..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    required
                  />
                </FormField>

                <div className="flex items-center justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={handleCloseTicket} className="text-xs text-rose-500 hover:text-rose-600">
                    Close Ticket
                  </Button>
                  <Button type="submit" variant="glow" size="sm" isLoading={isReplying} className="text-xs gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Post Reply
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Sheet>
    </PageContainer>
  );
}
