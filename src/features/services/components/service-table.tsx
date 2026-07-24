"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ClientService, ServiceStatus } from "@/types/service";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ExtendRenewalModal } from "./extend-renewal-modal";
import { EditServiceSheet } from "./edit-service-sheet";
import { DeleteServiceDialog } from "./delete-service-dialog";
import { deleteServiceAction } from "../actions/service-actions";
import {
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  CheckCircle,
  Globe,
  Server,
  Cloud,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";

interface ServiceTableProps {
  data: ClientService[];
  isLoading?: boolean;
  onStatusChange: (id: string, newStatus: ServiceStatus) => void;
  onRenew: (id: string) => void;
  onRefresh?: () => void;
  onServiceUpdated?: (id: string, updated: ClientService) => void;
  onServiceDeleted?: (id: string) => void;
}

export function ServiceTable({
  data,
  isLoading,
  onStatusChange,
  onRenew,
  onRefresh,
  onServiceUpdated,
  onServiceDeleted,
}: ServiceTableProps) {
  const [extendTarget, setExtendTarget] = useState<ClientService | null>(null);
  const [editTarget, setEditTarget] = useState<ClientService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientService | null>(null);

  const columns: ColumnDef<ClientService>[] = [
    {
      accessorKey: "customName",
      header: "Asset & Category",
      cell: ({ row }) => {
        const srv = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              {srv.categoryName.includes("Cloudflare") ? (
                <Cloud className="h-4 w-4 text-amber-500" />
              ) : srv.categoryName.includes("Server") ? (
                <Server className="h-4 w-4 text-purple-500" />
              ) : (
                <Globe className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div className="flex flex-col truncate">
              <Link
                href={`/admin/services/${srv.id}`}
                className="font-bold text-xs text-foreground hover:text-primary transition-colors truncate"
              >
                {srv.customName}
              </Link>
              <span className="text-[10px] text-muted-foreground truncate">{srv.categoryName}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "companyName",
      header: "Assigned Client",
      cell: ({ row }) => {
        const srv = row.original;
        return (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-foreground">{srv.companyName}</span>
            <span className="text-[10px] text-muted-foreground">{srv.clientName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "customPrice",
      header: "Cost & Cycle",
      cell: ({ row }) => {
        const srv = row.original;
        return (
          <div className="flex flex-col text-xs">
            <span className="font-bold text-foreground font-mono">
              ${srv.customPrice.toFixed(2)} {srv.currency}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">/ {srv.billingCycle}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "renewalDate",
      header: "Next Renewal",
      cell: ({ row }) => {
        const srv = row.original;
        if (!srv.renewalDate) return <span className="text-xs text-muted-foreground">N/A</span>;
        const renewalDate = new Date(srv.renewalDate);
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">{renewalDate.toLocaleDateString()}</span>
            <span className="text-[10px] text-muted-foreground">
              {srv.autoRenewal ? "Auto-Renew On" : "Manual Renewal"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "serviceStatus",
      header: "Status",
      cell: ({ row }) => {
        return <StatusBadge status={row.original.serviceStatus as any} />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const srv = row.original;
        return (
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
                id: "edit",
                label: "Edit Asset Details",
                icon: <Pencil className="h-3.5 w-3.5 text-blue-500" />,
                onClick: () => setEditTarget(srv),
              },
              {
                id: "extend-date",
                label: "Extend Renewal Date",
                icon: <Calendar className="h-3.5 w-3.5 text-purple-400" />,
                onClick: () => setExtendTarget(srv),
              },
              {
                id: "view",
                label: "View Asset Details",
                icon: <ExternalLink className="h-3.5 w-3.5" />,
                onClick: () => (window.location.href = `/admin/services/${srv.id}`),
              },
              {
                id: "renew",
                label: "Execute Renewal",
                icon: <RefreshCw className="h-3.5 w-3.5 text-blue-500" />,
                onClick: () => onRenew(srv.id),
              },
              {
                id: "activate",
                label: "Mark Active",
                icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />,
                onClick: () => onStatusChange(srv.id, "active"),
              },
              {
                id: "suspend",
                label: "Suspend Asset",
                icon: <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />,
                onClick: () => onStatusChange(srv.id, "suspended"),
              },
              {
                id: "delete",
                label: "Delete Asset",
                icon: <Trash2 className="h-3.5 w-3.5 text-rose-500" />,
                onClick: () => setDeleteTarget(srv),
                destructive: true,
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={data} isLoading={isLoading} searchPlaceholder="Search digital assets..." />
      {extendTarget && (
        <ExtendRenewalModal
          isOpen={!!extendTarget}
          onClose={() => setExtendTarget(null)}
          serviceId={extendTarget.id}
          serviceName={extendTarget.customName}
          currentRenewalDate={extendTarget.renewalDate}
          onSuccess={onRefresh}
        />
      )}

      {editTarget && (
        <EditServiceSheet
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          service={editTarget}
          categories={[]}
          onSuccess={() => {
            onRefresh?.();
            if (editTarget && onServiceUpdated) {
              onServiceUpdated(editTarget.id, editTarget);
            }
          }}
        />
      )}

      {deleteTarget && (
        <DeleteServiceDialog
          service={deleteTarget}
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={(id) => {
            onServiceDeleted?.(id);
            onRefresh?.();
          }}
          onDelete={deleteServiceAction}
        />
      )}
    </>
  );
}
