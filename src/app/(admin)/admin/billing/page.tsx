"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getInvoicesAction } from "@/features/billing/actions/billing-actions";
import { Invoice } from "@/types/billing";
import { DollarSign, CheckCircle, Clock, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingOverviewDashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const result = await getInvoicesAction();
        if (result.success && result.data) setInvoices(result.data.invoices);
      } catch (err) {
        console.error("Failed to load billing metrics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Financial & Billing Dashboard"
        description="Executive financial overview, collected revenue, outstanding balances, and recurring retainer metrics."
      />

      <ResponsiveGrid cols={3}>
        <StatCard
          title="Total Invoiced Volume"
          value={`$${totalInvoiced.toFixed(2)}`}
          subtitle="All generated invoices"
          icon={<DollarSign className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Total Collected Revenue"
          value={`$${totalCollected.toFixed(2)}`}
          trend="up"
          subtitle="Paid in full"
          icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${totalOutstanding.toFixed(2)}`}
          trend="neutral"
          subtitle="Accounts receivable"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
        />
      </ResponsiveGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Card */}
        <Card variant="glass" className="lg:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-bold text-foreground">Recent Invoices</h3>
            <Link
              href="/admin/invoices"
              className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
            >
              View Directory <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {invoices.slice(0, 4).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <Link href={`/admin/invoices/${inv.id}`} className="font-bold text-foreground hover:text-primary transition-colors block font-mono">
                      {inv.invoiceNumber}
                    </Link>
                    <span className="text-[10px] text-muted-foreground">{inv.companyName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-foreground font-mono block">${inv.grandTotal.toFixed(2)} {inv.currency}</span>
                  <StatusBadge status={inv.invoiceStatus as any} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Financial Governance Card */}
        <Card variant="glass" className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-3">
            Billing Security & Engine Status
          </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">Automated Invoice Formatting</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Sequential numbering (INV-2026-XXXXXX) with multi-currency tax calculation.</p>
                </div>
              </div>
            </div>
        </Card>
      </div>
    </PageContainer>
  );
}
