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
import { Sheet } from "@/components/ui/sheet";
import { PaymentTimeline } from "@/features/billing/components/payment-timeline";
import { ReceiptModal } from "@/features/billing/components/receipt-modal";
import {
  getPaymentsAction,
  getPaymentDetailsAction,
  resyncPaymentWithGatewayAction,
  manuallyVerifyPaymentAction,
} from "@/features/billing/actions/payment-actions";
import { PaymentRecord, PaymentFilters, PaymentLog, PaymentReceipt } from "@/types/payment";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

export default function AdminPaymentCenterPage() {
  const { toast, error: toastError } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentFilters>({ search: "", status: "all" });

  // Detail Sheet state
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<{
    payment: PaymentRecord;
    logs: PaymentLog[];
    receipt: PaymentReceipt | null;
  } | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Receipt Modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await getPaymentsAction(filters);
      if (res.success && res.data) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      toastError("Error", "Failed to load payment records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const handleOpenDetail = async (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDetailLoading(true);
    try {
      const res = await getPaymentDetailsAction(paymentId);
      if (res.success && res.data) {
        setDetailData(res.data as any);
      }
    } catch (err) {
      toastError("Error", "Failed to load payment detail logs.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleResync = async () => {
    if (!selectedPaymentId) return;
    setIsActionLoading(true);
    try {
      const res = await resyncPaymentWithGatewayAction(selectedPaymentId);
      if (res.success) {
        toast.success("Resynced with UddoktaPay!", {
          description: `Gateway status verified: ${res.data?.status || "COMPLETED"}.`,
        });
        await handleOpenDetail(selectedPaymentId);
        await fetchPayments();
      } else {
        toastError("Resync Failed", res.error || "Failed to resync payment.");
      }
    } catch (err: any) {
      toastError("Error", err?.message || "An error occurred.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleManualVerify = async () => {
    if (!selectedPaymentId) return;
    setIsActionLoading(true);
    try {
      const res = await manuallyVerifyPaymentAction(selectedPaymentId, "Verified via Admin Dashboard override");
      if (res.success) {
        toast.success("Payment Verified!", {
          description: "Payment status set to Completed and Invoice marked Paid.",
        });
        await handleOpenDetail(selectedPaymentId);
        await fetchPayments();
      } else {
        toastError("Verification Failed", res.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message || "An error occurred.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const totalCollected = payments
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingCount = payments.filter((p) => p.status === "pending" || p.status === "processing").length;
  const failedCount = payments.filter((p) => p.status === "failed" || p.status === "cancelled").length;
  const successCount = payments.filter((p) => p.status === "completed").length;

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="UddoktaPay Payment Infrastructure & Audit Center"
        description="Production payment management, real-time double verification, webhook audit logs, and receipt generation."
      />

      {/* KPI Stats */}
      <ResponsiveGrid cols={4}>
        <StatCard
          title="Total Collections"
          value={`$${totalCollected.toFixed(2)}`}
          trend="up"
          subtitle="Processed via UddoktaPay"
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Completed Payments"
          value={String(successCount)}
          subtitle="Verified transactions"
          icon={<CheckCircle className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Pending Gateways"
          value={String(pendingCount)}
          subtitle="Active checkout sessions"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
        />
        <StatCard
          title="Failed Attempts"
          value={String(failedCount)}
          subtitle="Cancelled or expired"
          icon={<AlertCircle className="h-4 w-4 text-rose-500" />}
        />
      </ResponsiveGrid>

      {/* Actions & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/80 glass-panel">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Payment # (PAY-2026-001), Invoice #, or Client..."
              value={filters.search || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0">
          <Button variant="outline" size="sm" onClick={fetchPayments} className="h-9 text-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Payment Directory Table */}
      <Card variant="glass" className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No UddoktaPay transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs mobile-card-table">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Payment #</th>
                  <th className="p-3">Client / Organization</th>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Gateway</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground" data-label="Payment #">{p.paymentNumber}</td>
                    <td className="p-3" data-label="Client / Organization">
                      <span className="font-bold text-foreground block">{p.companyName}</span>
                      <span className="text-muted-foreground text-[11px]">{p.clientName}</span>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground" data-label="Invoice #">{p.invoiceNumber || "N/A"}</td>
                    <td className="p-3 font-bold text-foreground" data-label="Amount">
                      ${p.amount.toFixed(2)} {p.currency}
                    </td>
                    <td className="p-3" data-label="Gateway">
                      <span className="capitalize font-medium">{p.method}</span>
                    </td>
                    <td className="p-3" data-label="Status">
                      <StatusBadge status={p.status as any} />
                    </td>
                    <td className="p-3 text-muted-foreground" data-label="Date">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="p-3 text-right" data-label="Actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(p.id)}
                        className="h-7 text-xs px-2.5"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> Inspect Log
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail & Audit Drawer */}
      <Sheet
        isOpen={Boolean(selectedPaymentId)}
        onClose={() => setSelectedPaymentId(null)}
        title="UddoktaPay Transaction & Webhook Log"
        description="Double verification status, timeline audit trail, and gateway actions."
      >
        {isDetailLoading || !detailData ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6 pt-2 pb-6">
            {/* Header info */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Payment Reference</span>
                <span className="font-mono font-bold text-base text-foreground">{detailData.payment.paymentNumber}</span>
                <span className="text-xs text-muted-foreground block font-mono">
                  Gateway Invoice: {detailData.payment.gatewayInvoiceId || "N/A"}
                </span>
              </div>
              <StatusBadge status={detailData.payment.status as any} />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResync}
                isLoading={isActionLoading}
                className="text-xs"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Resync with UddoktaPay
              </Button>

              {detailData.payment.status !== "completed" && (
                <Button
                  variant="glow"
                  size="sm"
                  onClick={handleManualVerify}
                  isLoading={isActionLoading}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Manually Verify Payment
                </Button>
              )}

              {detailData.receipt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReceiptModalOpen(true)}
                  className="text-xs"
                >
                  <FileCheck className="mr-1.5 h-3.5 w-3.5" />
                  View Receipt
                </Button>
              )}
            </div>

            {/* Audit Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Payment Audit Timeline</h4>
              <PaymentTimeline logs={detailData.logs} />
            </div>
          </div>
        )}
      </Sheet>

      {/* Receipt Modal */}
      {detailData?.receipt && (
        <ReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          receipt={detailData.receipt}
        />
      )}
    </PageContainer>
  );
}
