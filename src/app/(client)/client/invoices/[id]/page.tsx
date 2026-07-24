"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getInvoiceByIdAction } from "@/features/billing/actions/billing-actions";
import { getPaymentDetailsAction } from "@/features/billing/actions/payment-actions";
import { Invoice } from "@/types/billing";
import { PaymentReceipt, PaymentLog } from "@/types/payment";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InvoicePdfView } from "@/features/billing/components/invoice-pdf-view";
import { PaymentTimeline } from "@/features/billing/components/payment-timeline";
import { ReceiptModal } from "@/features/billing/components/receipt-modal";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Printer, Download, CheckCircle, CreditCard, ShieldCheck } from "lucide-react";

export default function ClientInvoiceDetailsPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const invoiceId = resolvedParams.id;
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchInvoiceAndPaymentData = async () => {
    setIsLoading(true);
    try {
      const res = await getInvoiceByIdAction(invoiceId);
      if (res.success && res.data) {
        setInvoice(res.data);
      } else {
        toast.error("Not Found", { description: "Invoice record not found." });
      }
    } catch (err) {
      console.error("Failed to load invoice details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceAndPaymentData();
  }, [invoiceId]);

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageContainer>
    );
  }

  if (!invoice) {
    return (
      <PageContainer maxWidth="xl">
        <div className="p-8 text-center glass-panel rounded-2xl space-y-4">
          <h2 className="text-lg font-bold">Invoice Not Found</h2>
          <p className="text-xs text-muted-foreground">The requested invoice record does not exist or has been removed.</p>
          <Link
            href="/client/invoices"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors"
          >
            Back to My Invoices
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isPaid = invoice.invoiceStatus === "paid";

  return (
    <PageContainer maxWidth="xl">
      {/* Back Button */}
      <div className="mb-4 print:hidden">
        <Link
          href="/client/invoices"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to My Invoices
        </Link>
      </div>

      {/* Top Banner & Payment CTA */}
      <Card variant="glass" className="p-5 mb-6 print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono font-bold text-lg text-foreground">{invoice.invoiceNumber}</h1>
              <StatusBadge status={invoice.invoiceStatus as any} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Due Date: {new Date(invoice.dueDate).toLocaleDateString()} &bull; Grand Total: ${invoice.grandTotal.toFixed(2)} {invoice.currency}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
              <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Invoice
            </Button>

            {!isPaid ? (
              <PayInvoiceButton
                invoiceId={invoice.id}
                amount={invoice.balanceDue}
                currency={invoice.currency}
                isPaid={isPaid}
              />
            ) : (
              <Button
                variant="glow"
                size="sm"
                onClick={() => setReceiptModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                View Official Receipt
              </Button>
            )}
          </div>
        </div>

        {!isPaid && (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Instant checkout available via bKash, Nagad, Rocket, Cards, and Net Banking.</span>
            </div>
            <span className="font-mono font-bold">Balance Due: ${invoice.balanceDue.toFixed(2)}</span>
          </div>
        )}
      </Card>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Printable Invoice */}
        <div className="lg:col-span-2 space-y-6">
          <InvoicePdfView invoice={invoice} />
        </div>

        {/* Timeline & Payment Status Side Panel */}
        <div className="space-y-6">
          <Card variant="glass" className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Payment Verification & Gateway</h3>
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-semibold text-foreground">UddoktaPay (v2 API)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Methods:</span>
                <span className="font-semibold text-foreground">bKash / Nagad / Card</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Double Verified:</span>
                <span className="font-semibold text-emerald-500">Yes (Server-Side)</span>
              </div>
            </div>
          </Card>

          {receipt && (
            <Card variant="glass" className="p-5 space-y-3 border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle className="h-5 w-5" />
                <span className="font-bold text-sm">Receipt Generated</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Receipt #{receipt.receiptNumber} issued for {receipt.currency} ${receipt.amount.toFixed(2)}.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReceiptModalOpen(true)}
                className="w-full text-xs"
              >
                Download Receipt PDF
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={
          receipt || {
            id: `rct-${invoice.id}`,
            paymentId: `pay-${invoice.id}`,
            invoiceId: invoice.id,
            receiptNumber: `RCT-${new Date().getFullYear()}-${invoice.invoiceNumber.slice(-6)}`,
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            companyName: invoice.companyName,
            amount: invoice.grandTotal,
            currency: invoice.currency,
            paymentMethod: "uddoktapay",
            transactionId: `TRX-${Date.now().toString().slice(-8)}`,
            issuedAt: new Date().toISOString(),
          }
        }
      />
    </PageContainer>
  );
}
