"use client";

import React from "react";
import Link from "next/link";
import { Invoice, InvoiceStatus } from "@/types/billing";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { FileText, Calendar, DollarSign, MoreHorizontal, ExternalLink, CheckCircle, XCircle } from "lucide-react";

interface InvoiceGridProps {
  data: Invoice[];
  onStatusChange: (id: string, newStatus: InvoiceStatus) => void;
}

export function InvoiceGrid({ data, onStatusChange }: InvoiceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((inv) => (
        <Card key={inv.id} variant="glass" className="hover:border-primary/40 transition-all duration-200 group">
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="truncate">
                <Link
                  href={`/admin/invoices/${inv.id}`}
                  className="font-bold text-sm font-mono text-foreground hover:text-primary transition-colors truncate block"
                >
                  {inv.invoiceNumber}
                </Link>
                <span className="text-xs text-muted-foreground truncate block">{inv.companyName}</span>
              </div>
            </div>

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
                  label: "View Invoice PDF",
                  icon: <ExternalLink className="h-3.5 w-3.5" />,
                  onClick: () => (window.location.href = `/admin/invoices/${inv.id}`),
                },
                {
                  id: "mark-paid",
                  label: "Mark Paid",
                  icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />,
                  onClick: () => onStatusChange(inv.id, "paid"),
                },
                {
                  id: "cancel",
                  label: "Cancel Invoice",
                  icon: <XCircle className="h-3.5 w-3.5 text-rose-500" />,
                  onClick: () => onStatusChange(inv.id, "cancelled"),
                },
              ]}
            />
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between pt-1">
              <StatusBadge status={inv.invoiceStatus as any} />
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                {inv.billingType}
              </Badge>
            </div>

            <div className="space-y-1.5 text-muted-foreground pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Grand Total
                </span>
                <span className="font-bold text-foreground font-mono">
                  ${inv.grandTotal.toFixed(2)} {inv.currency}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" /> Due Date
                </span>
                <span className="font-medium text-foreground">
                  {new Date(inv.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/40">
              <span>{inv.items.length} Line Item(s)</span>
              {inv.balanceDue > 0 ? (
                <span className="text-rose-500 font-mono font-bold">Due: ${inv.balanceDue.toFixed(2)}</span>
              ) : (
                <span className="text-emerald-500 font-bold">Fully Settled</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
