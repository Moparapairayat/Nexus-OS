"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { getClientByIdAction, updateClientStatusAction, deleteClientAction, archiveClientAction } from "@/features/clients/actions/client-actions";
import { getClientServicesAction } from "@/features/services/actions/service-actions";
import { getInvoicesAction } from "@/features/billing/actions/billing-actions";
import { getSupportTicketsAction } from "@/features/support/actions/support-actions";
import { Client, ClientStatus } from "@/types/client";
import { ClientService } from "@/types/service";
import { Invoice } from "@/types/billing";
import { SupportTicket } from "@/types/support";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ClientContactsManager } from "@/features/clients/components/client-contacts-manager";
import { ClientNotesManager } from "@/features/clients/components/client-notes-manager";
import { ClientFilesManager } from "@/features/clients/components/client-files-manager";
import { ClientActivityTimeline } from "@/features/clients/components/client-activity-timeline";
import { DeleteClientDialog } from "@/features/clients/components/delete-client-dialog";
import { InvitationLinkModal } from "@/features/clients/components/invitation-link-modal";
import { sendClientInvitationAction } from "@/features/auth/actions/invitation-actions";
import { impersonateClientAction } from "@/features/clients/actions/impersonation-actions";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CreditCard,
  Package,
  HelpCircle,
  Trash2,
  Mail,
  Key,
  ExternalLink,
  Plus,
  Clock,
  Shield,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;
  const { toast } = useToast();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [services, setServices] = useState<ClientService[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteModal, setInviteModal] = useState<{
    url: string;
    clientName: string;
    clientEmail: string;
    companyName: string;
  } | null>(null);

  const handleImpersonateClient = async () => {
    if (!client) return;
    try {
      toast.info("1-Click Client Login", { description: `Logging into Client Portal for ${client.companyName || client.name}...` });
      const result = await impersonateClientAction(client.id);
      if (result.success && result.redirectUrl) {
        toast.success("1-Click Login Successful", { description: `Now viewing Client Portal as ${client.companyName || client.name}` });
        router.push(result.redirectUrl);
        router.refresh();
      } else {
        toast.error("Login Failed", { description: result.error || "Could not log in as client." });
      }
    } catch (err: any) {
      toast.error("Error", { description: err?.message || "Failed to log in as client." });
    }
  };

  const handleSendInvitation = async () => {
    if (!client) return;
    try {
      const result = await sendClientInvitationAction(client.id, client.name, client.companyName, client.email);
      if (result.success && result.data) {
        setInviteModal({
          url: result.data.invitationUrl,
          clientName: client.name,
          clientEmail: client.email,
          companyName: client.companyName,
        });
        setClient((prev) => (prev ? { ...prev, clientStatus: "pending" } : null));
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to generate invitation link." });
    }
  };

  const fetchClientData = async () => {
    setIsLoading(true);
    try {
      const [clientRes, srvRes, invRes, tktRes] = await Promise.all([
        getClientByIdAction(clientId),
        getClientServicesAction({ clientId }).catch(() => ({ success: false, data: null })),
        getInvoicesAction({ clientId }).catch(() => ({ success: false, data: null })),
        getSupportTicketsAction({ clientId }).catch(() => ({ success: false, data: null })),
      ]);

      if (clientRes.success && clientRes.data) {
        setClient(clientRes.data);
      } else {
        toast.error("Not Found", { description: "Client profile not found." });
      }

      if (srvRes.success && srvRes.data) {
        setServices(srvRes.data.services || []);
      }

      if (invRes.success && invRes.data) {
        setInvoices(invRes.data.invoices || []);
      }

      if (tktRes.success && tktRes.data) {
        setTickets(tktRes.data.tickets || []);
      }
    } catch (err: any) {
      toast.error("Error", { description: "Failed to load client details." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const handleStatusChange = async (newStatus: ClientStatus) => {
    if (!client) return;
    try {
      const result = await updateClientStatusAction(client.id, newStatus);
      if (result.success && "data" in result && result.data) {
        setClient(result.data as Client);
        toast.success("Status Updated", { description: `Client status changed to ${newStatus}.` });
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to update status." });
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageContainer>
    );
  }

  if (!client) {
    return (
      <PageContainer maxWidth="xl">
        <div className="p-8 text-center glass-panel rounded-2xl space-y-4">
          <h2 className="text-lg font-bold">Client Profile Not Found</h2>
          <p className="text-xs text-muted-foreground">The requested client record does not exist or has been deleted.</p>
          <Link
            href="/admin/clients"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors"
          >
            Back to Directory
          </Link>
        </div>
      </PageContainer>
    );
  }

  const primaryContact = client.contacts?.find((c) => c.isPrimary) || client.contacts?.[0];

  const tabItems = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Company Info Card */}
            <Card variant="glass" className="lg:col-span-2 p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-2">
                Company Details & Governance
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Business Reg No.</span>
                  <span className="font-semibold text-foreground">{client.businessRegNo || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Tax Registration</span>
                  <span className="font-semibold text-foreground">{client.taxNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Industry</span>
                  <span className="font-semibold text-foreground">{client.industry || "General Services"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Website</span>
                  {client.website ? (
                    <a href={client.website} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
                      {client.website}
                    </a>
                  ) : (
                    <span className="font-semibold text-muted-foreground">N/A</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Currency & Region</span>
                  <span className="font-semibold text-foreground uppercase">{client.preferredCurrency} ({client.country})</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Language & Timezone</span>
                  <span className="font-semibold text-foreground">{client.preferredLanguage.toUpperCase()} / {client.timezone}</span>
                </div>
              </div>
            </Card>

            {/* Quick Metrics Card */}
            <Card variant="glass" className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-2">
                Account Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20">
                  <span className="text-muted-foreground">Active Services</span>
                  <span className="font-bold text-foreground">{services.filter((s) => s.serviceStatus === "active").length}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20">
                  <span className="text-muted-foreground">Total Invoices</span>
                  <span className="font-bold text-foreground">{invoices.length}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20">
                  <span className="text-muted-foreground">Open Tickets</span>
                  <span className="font-bold text-foreground">{tickets.filter((t) => t.status !== "closed").length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "contacts",
      label: `Contacts (${client.contacts?.length || 0})`,
      content: <div className="pt-4"><ClientContactsManager clientId={client.id} contacts={client.contacts || []} /></div>,
    },
    {
      id: "notes",
      label: `Admin Notes (${client.adminNotes?.length || 0})`,
      content: <div className="pt-4"><ClientNotesManager clientId={client.id} notes={client.adminNotes || []} /></div>,
    },
    {
      id: "files",
      label: `Files (${client.files?.length || 0})`,
      content: <div className="pt-4"><ClientFilesManager clientId={client.id} files={client.files || []} /></div>,
    },
    {
      id: "activity",
      label: "Activity Timeline",
      content: <div className="pt-4"><ClientActivityTimeline activities={client.activities || []} /></div>,
    },
    {
      id: "services",
      label: `Services (${services.length})`,
      content: (
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">Provisioned Digital Services ({services.length})</h4>
            <Link href="/admin/services">
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Assign New Service
              </Button>
            </Link>
          </div>

          {services.length === 0 ? (
            <Card variant="glass" className="p-8 text-center space-y-3">
              <Package className="h-8 w-8 text-blue-500 mx-auto" />
              <h4 className="text-sm font-bold">No Digital Assets Provisioned</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                No hosting retainers, domains, SSL certificates, or Cloudflare assets have been assigned to {client.companyName} yet.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map((srv) => (
                <Card key={srv.id} variant="glass" className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{srv.customName}</span>
                    <StatusBadge status={srv.serviceStatus as any} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{srv.categoryName} &bull; {srv.domainName || "Active"}</p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>${srv.customPrice.toFixed(2)} / {srv.billingCycle}</span>
                    <Link href={`/admin/services/${srv.id}`} className="text-primary hover:underline font-semibold flex items-center gap-1">
                      Manage <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "billing",
      label: `Billing & Invoices (${invoices.length})`,
      content: (
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">Invoices & Financial Records ({invoices.length})</h4>
            <Link href="/admin/invoices">
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Create Invoice
              </Button>
            </Link>
          </div>

          {invoices.length === 0 ? (
            <Card variant="glass" className="p-8 text-center space-y-3">
              <CreditCard className="h-8 w-8 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold">No Invoices Issued</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                No billing statements or invoices have been generated for {client.companyName} yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    <div>
                      <Link href={`/admin/invoices/${inv.id}`} className="font-bold text-foreground hover:text-primary transition-colors block">
                        {inv.invoiceNumber}
                      </Link>
                      <span className="text-[11px] text-muted-foreground">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "On Receipt"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">${inv.grandTotal.toFixed(2)} {inv.currency}</span>
                    <StatusBadge status={inv.invoiceStatus as any} />
                    <Link href={`/admin/invoices/${inv.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "support",
      label: `Support Tickets (${tickets.length})`,
      content: (
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">Support Tickets ({tickets.length})</h4>
            <Link href="/admin/support">
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Open Ticket
              </Button>
            </Link>
          </div>

          {tickets.length === 0 ? (
            <Card variant="glass" className="p-8 text-center space-y-3">
              <HelpCircle className="h-8 w-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold">No Support Tickets</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                No active or historical support requests found for {client.companyName}.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {tickets.map((tkt) => (
                <div key={tkt.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 text-xs">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                    <div>
                      <span className="font-bold text-foreground block">{tkt.subject}</span>
                      <span className="text-[11px] text-muted-foreground">Ticket #{tkt.ticketNumber} &bull; Priority: {tkt.priority}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={tkt.status as any} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="xl">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/admin/clients"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Clients Directory
        </Link>
      </div>

      {/* Header Profile Summary */}
      <Card variant="glass" className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={client.companyLogo} fallback={client.companyName} size="lg" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{client.companyName}</h1>
                <StatusBadge status={client.clientStatus as any} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>Primary Contact: <strong className="text-foreground">{client.name}</strong></span>
                <span>&bull;</span>
                <span>{client.country}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="glow"
              size="sm"
              onClick={handleImpersonateClient}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5 font-semibold"
            >
              <Key className="h-3.5 w-3.5" />
              Login to Client Portal (1-Click)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendInvitation}
              className="text-xs border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
            >
              <Mail className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
              Send Invitation Link
            </Button>
            <Button
              variant={client.clientStatus === "active" ? "secondary" : "glow"}
              size="sm"
              onClick={() => handleStatusChange(client.clientStatus === "active" ? "suspended" : "active")}
              className="text-xs"
            >
              {client.clientStatus === "active" ? "Suspend Account" : "Activate Account"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-xs"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs items={tabItems} defaultTabId="overview" />

      {/* Delete Dialog */}
      <DeleteClientDialog
        client={client}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleted={() => {
          toast.success("Client Removed", { description: "Client record permanently deleted." });
          router.push("/admin/clients");
        }}
        onArchived={() => {
          toast.success("Client Archived", { description: "Client account archived." });
          handleStatusChange("archived");
        }}
        onDelete={deleteClientAction}
        onArchive={archiveClientAction}
      />

      {/* Invitation Modal */}
      {inviteModal && (
        <InvitationLinkModal
          isOpen={!!inviteModal}
          onClose={() => setInviteModal(null)}
          invitationUrl={inviteModal.url}
          clientName={inviteModal.clientName}
          clientEmail={inviteModal.clientEmail}
          companyName={inviteModal.companyName}
        />
      )}
    </PageContainer>
  );
}
