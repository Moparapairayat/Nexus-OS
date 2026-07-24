"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getInvoiceByIdAction, updateInvoiceStatusAction } from "@/features/billing/actions/billing-actions";
import { Invoice, InvoiceStatus } from "@/types/billing";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { InvoicePdfView } from "@/features/billing/components/invoice-pdf-view";
import { InvoiceEmailArchitecture } from "@/features/billing/components/invoice-email-architecture";
import { Timeline } from "@/components/ui/timeline";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle,
  CreditCard,
  FileText,
  XCircle,
} from "lucide-react";

export default function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const invoiceId = resolvedParams.id;
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoiceData = async () => {
    setIsLoading(true);
    try {
      const result = await getInvoiceByIdAction(invoiceId);
      if (result.success && result.data) {
        setInvoice(result.data);
      } else {
        toast.error("Not Found", { description: "Invoice record not found." });
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to load invoice details." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [invoiceId]);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (!invoice) return;
    try {
      const result = await updateInvoiceStatusAction(invoice.id, newStatus);
      if (result.success && result.data) {
        setInvoice(result.data);
        toast.success("Status Updated", { description: `Invoice status changed to ${newStatus}.` });
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to update status." });
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
            href="/admin/invoices"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors"
          >
            Back to Directory
          </Link>
        </div>
      </PageContainer>
    );
  }

  const timelineEvents = (invoice.activities || []).map((act) => ({
    id: act.id,
    title: act.title,
    description: act.description,
    timestamp: new Date(act.timestamp).toLocaleString(),
    icon: <CheckCircle className="h-3.5 w-3.5 text-primary" />,
  }));

  const tabItems = [
    {
      id: "pdf-view",
      label: "Printable Invoice & PDF View",
      content: (
        <div className="pt-4">
          <InvoicePdfView invoice={invoice} />
        </div>
      ),
    },
    {
      id: "payment-email",
      label: "Payment & Communication",
      content: (
        <div className="pt-4 space-y-6">
          <Card variant="glass" className="p-5 space-y-3 border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm text-foreground">Manual Payment Processing</span>
              </div>
              <StatusBadge status={invoice.invoiceStatus as any} />
            </div>
            <p className="text-xs text-muted-foreground">
              Payments are managed manually by the admin team. Mark invoices as paid via the Payments & Audit Center once payment is confirmed.
            </p>
          </Card>

          <InvoiceEmailArchitecture
            invoiceNumber={invoice.invoiceNumber}
            clientEmail={invoice.clientEmail}
            amount={`$${invoice.grandTotal.toFixed(2)} ${invoice.currency}`}
          />
        </div>
      ),
    },
    {
      id: "timeline",
      label: "Activity Timeline",
      content: (
        <div className="pt-4 space-y-4">
          <h3 className="text-base font-bold tracking-tight">Invoice Event Audit Trail</h3>
          <Timeline events={timelineEvents} />
        </div>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="xl">
      {/* Back Button */}
      <div className="mb-4 print:hidden">
        <Link
          href="/admin/invoices"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Invoices Directory
        </Link>
      </div>

      {/* Action Bar */}
      <Card variant="glass" className="p-4 mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <h1 className="font-mono font-bold text-base text-foreground">{invoice.invoiceNumber}</h1>
            <p className="text-xs text-muted-foreground">{invoice.companyName} &bull; ${invoice.grandTotal.toFixed(2)} {invoice.currency}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / PDF
          </Button>
          {invoice.invoiceStatus !== "paid" && (
            <Button variant="glow" size="sm" onClick={() => handleStatusChange("paid")} className="text-xs">
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Mark Paid
            </Button>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs items={tabItems} defaultTabId="pdf-view" className="print:block" />
    </PageContainer>
  );
}
