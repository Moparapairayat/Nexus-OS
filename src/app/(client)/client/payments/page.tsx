"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ReceiptModal } from "@/features/billing/components/receipt-modal";
import { getPaymentsAction, getPaymentDetailsAction } from "@/features/billing/actions/payment-actions";
import { PaymentRecord, PaymentReceipt } from "@/types/payment";
import { CreditCard, DollarSign, CheckCircle, FileCheck, ShieldCheck } from "lucide-react";

export default function ClientPaymentsHistoryPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

  const fetchClientPayments = async () => {
    setIsLoading(true);
    try {
      const res = await getPaymentsAction();
      if (res.success && res.data) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error("Failed to load client payment history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientPayments();
  }, []);

  const handleViewReceipt = async (paymentId: string) => {
    try {
      const res = await getPaymentDetailsAction(paymentId);
      if (res.success && res.data?.receipt) {
        setSelectedReceipt(res.data.receipt);
      }
    } catch (err) {
      console.error("Failed to load receipt details:", err);
    }
  };

  const totalPaid = payments
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + p.amount, 0);

  const successCount = payments.filter((p) => p.status === "completed").length;

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="My Payment & Transaction History"
        description="Records of all settled invoices, UddoktaPay transactions, and downloadable official receipts."
      />

      <ResponsiveGrid cols={3}>
        <StatCard
          title="Total Settled"
          value={`$${totalPaid.toFixed(2)}`}
          subtitle="Processed & verified"
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Successful Payments"
          value={String(successCount)}
          subtitle="Verified via UddoktaPay"
          icon={<CheckCircle className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Security SLA"
          value="100% Protected"
          subtitle="Double Verification Active"
          icon={<ShieldCheck className="h-4 w-4 text-purple-500" />}
        />
      </ResponsiveGrid>

      <Card variant="glass" className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No payment history records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Payment #</th>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Gateway Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground">{p.paymentNumber}</td>
                    <td className="p-3 font-mono text-muted-foreground">{p.invoiceNumber || "N/A"}</td>
                    <td className="p-3 font-bold text-foreground">
                      ${p.amount.toFixed(2)} {p.currency}
                    </td>
                    <td className="p-3 capitalize font-medium">{p.method}</td>
                    <td className="p-3">
                      <StatusBadge status={p.status as any} />
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      {p.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReceipt(p.id)}
                          className="h-7 text-xs px-2.5"
                        >
                          <FileCheck className="mr-1 h-3.5 w-3.5" /> View Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />
    </PageContainer>
  );
}
