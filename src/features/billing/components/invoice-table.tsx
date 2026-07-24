"use client";

import React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Invoice, InvoiceStatus } from "@/types/billing";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink, CheckCircle, Clock, FileText, XCircle } from "lucide-react";

interface InvoiceTableProps {
  data: Invoice[];
  isLoading?: boolean;
  onStatusChange: (id: string, newStatus: InvoiceStatus) => void;
}

export function InvoiceTable({ data, isLoading, onStatusChange }: InvoiceTableProps) {
  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice # & Date",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex flex-col truncate">
              <Link
                href={`/admin/invoices/${inv.id}`}
                className="font-bold text-xs font-mono text-foreground hover:text-primary transition-colors truncate"
              >
                {inv.invoiceNumber}
              </Link>
              <span className="text-[10px] text-muted-foreground">
                Issued: {new Date(inv.issueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "companyName",
      header: "Client & Company",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-foreground truncate">{inv.companyName}</span>
            <span className="text-[10px] text-muted-foreground truncate">{inv.clientName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "grandTotal",
      header: "Total & Balance",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex flex-col text-xs">
            <span className="font-bold text-foreground font-mono">
              ${inv.grandTotal.toFixed(2)} {inv.currency}
            </span>
            {inv.balanceDue > 0 ? (
              <span className="text-[10px] text-rose-500 font-mono font-medium">Due: ${inv.balanceDue.toFixed(2)}</span>
            ) : (
              <span className="text-[10px] text-emerald-500 font-medium">Settled</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const inv = row.original;
        const dueDate = new Date(inv.dueDate);
        const isOverdue = inv.invoiceStatus === "overdue" || (inv.balanceDue > 0 && dueDate.getTime() < new Date().getTime());

        return (
          <div className="flex flex-col text-xs">
            <span className={`font-medium ${isOverdue ? "text-rose-500 font-semibold" : "text-foreground"}`}>
              {dueDate.toLocaleDateString()}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-mono">{inv.billingType}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "invoiceStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.invoiceStatus;
        return <StatusBadge status={status as any} />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            }
            align="right"
            items={[
              {
                id: "view",
                label: "View Invoice & Printable PDF",
                icon: <ExternalLink className="h-3.5 w-3.5" />,
                onClick: () => (window.location.href = `/admin/invoices/${inv.id}`),
              },
              {
                id: "mark-paid",
                label: "Mark Paid in Full",
                icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />,
                onClick: () => onStatusChange(inv.id, "paid"),
              },
              {
                id: "mark-overdue",
                label: "Mark Overdue",
                icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,
                onClick: () => onStatusChange(inv.id, "overdue"),
              },
              {
                id: "cancel",
                label: "Cancel Invoice",
                icon: <XCircle className="h-3.5 w-3.5 text-rose-500" />,
                onClick: () => onStatusChange(inv.id, "cancelled"),
              },
            ]}
          />
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} isLoading={isLoading} searchPlaceholder="Search invoices..." />;
}
