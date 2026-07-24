"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Client, ClientStatus } from "@/types/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DeleteClientDialog } from "./delete-client-dialog";
import { InvitationLinkModal } from "./invitation-link-modal";
import { deleteClientAction, archiveClientAction } from "@/features/clients/actions/client-actions";
import { sendClientInvitationAction } from "@/features/auth/actions/invitation-actions";
import { impersonateClientAction } from "@/features/clients/actions/impersonation-actions";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Trash2,
  Archive,
  Send,
  Key,
} from "lucide-react";

interface ClientGridProps {
  data: Client[];
  onStatusChange: (id: string, newStatus: ClientStatus) => void;
  onClientDeleted?: (clientId: string) => void;
}

export function ClientGrid({ data, onStatusChange, onClientDeleted }: ClientGridProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [inviteModal, setInviteModal] = useState<{
    url: string;
    clientName: string;
    clientEmail: string;
    companyName: string;
  } | null>(null);

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

  const handleDeleted = (clientId: string) => {
    toast.success("Client Removed", { description: "Client record and portal access permanently deleted." });
    onClientDeleted?.(clientId);
  };

  const handleArchived = (clientId: string) => {
    toast.success("Client Archived", { description: "Client archived. Data preserved, portal access revoked." });
    onStatusChange(clientId, "archived");
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((client) => (
          <Card key={client.id} variant="glass" className="hover:border-primary/40 transition-all duration-200 group">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={client.companyLogo} fallback={client.companyName} size="md" />
                <div className="truncate">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate block"
                  >
                    {client.companyName}
                  </Link>
                  <span className="text-xs text-muted-foreground truncate block">{client.name}</span>
                </div>
              </div>

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
                    label: "View Profile",
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
                    label: "Suspend",
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
                    label: "Remove Permanently",
                    icon: <Trash2 className="h-3.5 w-3.5 text-rose-500" />,
                    onClick: () => setDeleteTarget(client),
                  },
                ]}
              />
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between pt-1">
                <StatusBadge status={client.clientStatus as any} />
                <span className="text-[10px] text-muted-foreground font-mono uppercase bg-muted/60 px-2 py-0.5 rounded-md">
                  {client.preferredCurrency}
                </span>
              </div>

              <div className="space-y-1 text-muted-foreground">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{client.country}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleImpersonate(client.id, client.companyName || client.name)}
                className="w-full h-7 text-xs font-semibold text-purple-600 border-purple-500/30 hover:bg-purple-500/10 dark:text-purple-400 gap-1.5 mt-1"
              >
                <Key className="h-3.5 w-3.5" />
                Login to Portal (1-Click)
              </Button>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-2 border-t border-border/40">
                {client.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeleteClientDialog
        client={deleteTarget}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
        onArchived={handleArchived}
        onDelete={deleteClientAction}
        onArchive={archiveClientAction}
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
