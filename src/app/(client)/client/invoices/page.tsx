"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { getInvoicesAction } from "@/features/billing/actions/billing-actions";
import { Invoice } from "@/types/billing";
import { FileText, DollarSign, CreditCard, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClientInvoicesPortalPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadClientInvoices() {
      setIsLoading(true);
      try {
        const result = await getInvoicesAction();
        if (result.success && result.data) {
          setInvoices(result.data.invoices);
        }
      } catch (err) {
        console.error("Failed to load client invoices:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadClientInvoices();
  }, []);

  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);
  const paidCount = invoices.filter((inv) => inv.invoiceStatus === "paid").length;

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="My Billing & Invoices"
        description="View your invoice history, outstanding balance, download receipts, and access online payment options."
      />

      <ResponsiveGrid cols={3}>
        <StatCard
          title="Outstanding Balance"
          value={`$${totalOutstanding.toFixed(2)}`}
          subtitle="Balance due across accounts"
          icon={<DollarSign className="h-4 w-4 text-rose-500" />}
        />
        <StatCard
          title="Total Invoices"
          value={invoices.length.toString()}
          subtitle="All generated statements"
          icon={<FileText className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Paid Statements"
          value={paidCount.toString()}
          subtitle="Settled in full"
          icon={<CreditCard className="h-4 w-4 text-emerald-500" />}
        />
      </ResponsiveGrid>

      <div className="space-y-4">
        <h3 className="text-base font-bold tracking-tight">Invoice History ({invoices.length})</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <Card key={inv.id} variant="glass" className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">{inv.invoiceNumber}</span>
                      <StatusBadge status={inv.invoiceStatus as any} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Issued: {new Date(inv.issueDate).toLocaleDateString()} &bull; Due: {new Date(inv.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right font-mono">
                    <span className="font-bold text-foreground text-sm block">${inv.grandTotal.toFixed(2)} {inv.currency}</span>
                    {inv.balanceDue > 0 ? (
                      <span className="text-[10px] text-rose-500 font-semibold">Due: ${inv.balanceDue.toFixed(2)}</span>
                    ) : (
                      <span className="text-[10px] text-emerald-500 font-semibold">Paid in Full</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/invoices/${inv.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                    >
                      <Download className="mr-1 h-3 w-3" /> View / PDF
                    </Link>
                    {inv.balanceDue > 0 && (
                      <Button
                        variant="glow"
                        size="sm"
                        onClick={async () => {
                          try {
                            toast.info("UddoktaPay Gateway", { description: "Launching secure payment gateway..." });
                            const { createUddoktaPayCheckoutAction } = await import("@/features/billing/actions/payment-actions");
                            const res = await createUddoktaPayCheckoutAction(inv.id);
                            const checkoutUrl = "checkoutUrl" in res ? res.checkoutUrl : null;
                            if (res.success && checkoutUrl) {
                              window.location.href = checkoutUrl;
                            } else {
                              toast.error("Payment Gateway Notice", { description: res.error || "UddoktaPay API connection ready." });
                            }
                          } catch (e: any) {
                            toast.error("Gateway Error", { description: e?.message || "Failed to launch gateway." });
                          }
                        }}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Pay Online (UddoktaPay)
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
