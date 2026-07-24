"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Client, ClientStatus } from "@/types/client";
import { DataTable } from "@/components/ui/data-table";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DeleteClientDialog } from "./delete-client-dialog";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { InvitationLinkModal } from "./invitation-link-modal";
import { useToast } from "@/hooks/use-toast";
import { sendClientInvitationAction } from "@/features/auth/actions/invitation-actions";
import { impersonateClientAction } from "@/features/clients/actions/impersonation-actions";
import {
  deleteClientAction,
  archiveClientAction,
  deleteManyClientsAction,
  archiveManyClientsAction,
} from "@/features/clients/actions/client-actions";
import {
  MoreHorizontal,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Mail,
  Trash2,
  Archive,
  CheckSquare,
  Square,
  Minus,
  Users,
  Key,
} from "lucide-react";

interface ClientTableProps {
  data: Client[];
  isLoading?: boolean;
  onStatusChange: (id: string, newStatus: ClientStatus) => void;
  onClientDeleted?: (clientId: string) => void;
  onClientsDeleted?: (clientIds: string[]) => void;
}

export function ClientTable({
  data,
  isLoading,
  onStatusChange,
  onClientDeleted,
  onClientsDeleted,
}: ClientTableProps) {
  const { toast } = useToast();
  const router = useRouter();

  // Single delete
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  // Invitation modal
  const [inviteModal, setInviteModal] = useState<{
    url: string;
    clientName: string;
    clientEmail: string;
    companyName: string;
  } | null>(null);

  // ── Selection helpers ──────────────────────────────────────
  const allSelected = data.length > 0 && selectedIds.size === data.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < data.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((c) => c.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedClients = data.filter((c) => selectedIds.has(c.id));

  // ── Single actions ─────────────────────────────────────────
  const handleImpersonate = async (clientId: string, name: string) => {
    try {
      toast.info("1-Click Client Login", { description: `Logging into Client Portal for ${name}...` });
      const result = await impersonateClientAction(clientId);
      if (result.success && result.redirectUrl) {
        toast.success("1-Click Login Successful", { description: `Now viewing Client Portal as ${name}` });
        router.push(result.redirectUrl);
        router.refresh();
      } else {
        toast.error("Login Failed", { description: result.error || "Could not log in as client." });
      }
    } catch (err: any) {
      toast.error("Error", { description: err?.message || "Failed to log in as client." });
    }
  };

  const handleSendInvitation = async (client: Client) => {
    try {
      const result = await sendClientInvitationAction(client.id, client.name, client.companyName, client.email);
      if (result.success && result.data) {
        setInviteModal({
          url: result.data.invitationUrl,
          clientName: client.name,
          clientEmail: client.email,
          companyName: client.companyName,
        });
        onStatusChange(client.id, "pending");
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to generate invitation link." });
    }
  };

  const handleSingleDeleted = (clientId: string) => {
    toast.success("Client Removed", { description: "Client record permanently deleted." });
    onClientDeleted?.(clientId);
    clearSelection();
  };

  const handleSingleArchived = (clientId: string) => {
    toast.success("Client Archived", { description: "Portal access revoked, data preserved." });
    onStatusChange(clientId, "archived");
  };

  // ── Bulk actions ───────────────────────────────────────────
  const handleBulkDeleted = (ids: string[]) => {
    toast.success(`${ids.length} Clients Removed`, { description: "All selected records permanently deleted." });
    onClientsDeleted?.(ids);
    clearSelection();
  };

  const handleBulkArchived = (ids: string[]) => {
    toast.success(`${ids.length} Clients Archived`, { description: "Portal access revoked, data preserved." });
    ids.forEach((id) => onStatusChange(id, "archived"));
    clearSelection();
  };

  // ── Table column definitions ───────────────────────────────
  const columns: ColumnDef<Client>[] = [
    // Checkbox column — rendered outside DataTable via custom table
    {
      accessorKey: "companyName",
      header: "Client & Company",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar src={client.companyLogo} fallback={client.companyName} size="md" />
            <div className="flex flex-col truncate">
              <Link
                href={`/admin/clients/${client.id}`}
                className="font-semibold text-xs text-foreground hover:text-primary transition-colors truncate"
              >
                {client.companyName}
              </Link>
              <span className="text-[11px] text-muted-foreground truncate">{client.name}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Contact Details",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground truncate">{client.email}</span>
            {client.phone && <span className="text-[10px] text-muted-foreground mt-0.5">{client.phone}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "country",
      header: "Location & Currency",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">{client.country}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-mono">{client.preferredCurrency}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "clientStatus",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.clientStatus as any} />,
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">+{tags.length - 2}</Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex items-center gap-1.5 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleImpersonate(client.id, client.companyName || client.name)}
              className="h-7 text-[11px] px-2 text-purple-600 border-purple-500/30 hover:bg-purple-500/10 dark:text-purple-400 gap-1 font-semibold"
              title="1-Click Login to Client Portal"
            >
              <Key className="h-3 w-3" />
              Portal Login
            </Button>
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              }
              side="auto"
              align="right"
              items={[
                {
                  id: "impersonate",
                  label: "Login to Client Portal (1-Click)",
                  icon: <Key className="h-3.5 w-3.5 text-purple-500" />,
                  onClick: () => handleImpersonate(client.id, client.companyName || client.name),
                },
                {
                  id: "view",
                  label: "View Profile Details",
                  icon: <ExternalLink className="h-3.5 w-3.5" />,
                  onClick: () => (window.location.href = `/admin/clients/${client.id}`),
                },
                {
                  id: "invite",
                  label: "Send Portal Invitation Link",
                  icon: <Mail className="h-3.5 w-3.5 text-blue-500" />,
                  onClick: () => handleSendInvitation(client),
                },
                {
                  id: "activate",
                  label: "Mark Active",
                  icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />,
                  onClick: () => onStatusChange(client.id, "active"),
                },
                {
                  id: "suspend",
                  label: "Suspend Account",
                  icon: <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />,
                  onClick: () => onStatusChange(client.id, "suspended"),
                },
                {
                  id: "archive",
                  label: "Archive Client",
                  icon: <Archive className="h-3.5 w-3.5 text-amber-500" />,
                  onClick: () => onStatusChange(client.id, "archived"),
                },
                {
                  id: "delete",
                  label: "Remove Client Permanently",
                  icon: <Trash2 className="h-3.5 w-3.5 text-rose-500" />,
                  onClick: () => setDeleteTarget(client),
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* ── Bulk Action Toolbar ─────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              className="h-5 w-5 rounded flex items-center justify-center border-2 border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Clear selection"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-semibold text-foreground">
              <strong>{selectedIds.size}</strong> client{selectedIds.size > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              onClick={() => {
                archiveManyClientsAction(Array.from(selectedIds)).then((res) => {
                  if (res.success) handleBulkArchived(Array.from(selectedIds));
                });
              }}
            >
              <Archive className="mr-1.5 h-3.5 w-3.5" />
              Archive Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-[11px] bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => setBulkDialogOpen(true)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete {selectedIds.size} Selected
            </Button>
          </div>
        </div>
      )}

      {/* ── Table with checkboxes ───────────────────────────── */}
      <div className="rounded-2xl border border-border/80 bg-card/30">
        {/* Select-all header */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/60 bg-muted/20">
          <button
            onClick={toggleAll}
            className="h-4.5 w-4.5 flex items-center justify-center"
            title={allSelected ? "Deselect all" : "Select all"}
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : someSelected ? (
              <div className="h-4 w-4 rounded border-2 border-primary bg-primary/20 flex items-center justify-center">
                <Minus className="h-2.5 w-2.5 text-primary" />
              </div>
            ) : (
              <Square className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </button>
          <span className="text-[11px] text-muted-foreground font-medium">
            {allSelected
              ? `All ${data.length} clients selected`
              : someSelected
              ? `${selectedIds.size} of ${data.length} selected`
              : `Select clients for bulk actions`}
          </span>
          {data.length > 0 && !allSelected && (
            <button onClick={toggleAll} className="text-[11px] text-primary hover:underline ml-auto">
              Select all {data.length}
            </button>
          )}
        </div>

        {/* Main DataTable — with per-row checkbox overlay */}
        <div className="relative">
          {/* Row checkboxes overlay (desktop only) */}
          {!isLoading && data.length > 0 && (
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none">
              {/* Spacer for header row ~40px */}
              <div style={{ height: 40 }} />
              {data.map((client, i) => (
                <div
                  key={client.id}
                  className="flex items-center justify-center pointer-events-auto"
                  style={{ height: 53 }}
                >
                  <button
                    onClick={() => toggleOne(client.id)}
                    className={`h-4 w-4 flex items-center justify-center rounded border-2 transition-all ${
                      selectedIds.has(client.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40 hover:border-primary"
                    }`}
                  >
                    {selectedIds.has(client.id) && (
                      <CheckSquare className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={!isLoading && data.length > 0 ? "pl-10 md:pl-0" : ""}>
            <DataTable
              columns={columns}
              data={data}
              isLoading={isLoading}
              searchPlaceholder="Search clients..."
            />
          </div>
        </div>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────── */}
      <DeleteClientDialog
        client={deleteTarget}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleSingleDeleted}
        onArchived={handleSingleArchived}
        onDelete={deleteClientAction}
        onArchive={archiveClientAction}
      />

      <BulkDeleteDialog
        clients={selectedClients}
        isOpen={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onDeleted={handleBulkDeleted}
        onArchived={handleBulkArchived}
        onBulkDelete={deleteManyClientsAction}
        onBulkArchive={archiveManyClientsAction}
      />

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
    </>
  );
}
