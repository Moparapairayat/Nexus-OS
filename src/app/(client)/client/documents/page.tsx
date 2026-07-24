"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReceiptModal } from "@/features/billing/components/receipt-modal";
import { getInvoicesAction } from "@/features/billing/actions/billing-actions";
import { getPaymentsAction, getPaymentDetailsAction } from "@/features/billing/actions/payment-actions";
import { PaymentReceipt } from "@/types/payment";
import { Invoice } from "@/types/billing";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  FolderOpen,
  FileCheck2,
  Receipt,
  Shield,
  Printer,
} from "lucide-react";

type DocCategory = "all" | "invoice" | "receipt" | "contract";

interface DocumentItem {
  id: string;
  name: string;
  category: DocCategory;
  fileType: string;
  fileSize: string;
  date: string;
  invoiceId?: string;
  paymentId?: string;
}

export default function ClientDocumentsPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<DocCategory>("all");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

  useEffect(() => {
    async function loadDocuments() {
      setIsLoading(true);
      try {
        const [invRes, payRes] = await Promise.all([
          getInvoicesAction(),
          getPaymentsAction(),
        ]);

        const items: DocumentItem[] = [];

        if (invRes.success && invRes.data) {
          invRes.data.invoices.forEach((inv) => {
            items.push({
              id: `doc-inv-${inv.id}`,
              name: `Invoice ${inv.invoiceNumber}.pdf`,
              category: "invoice",
              fileType: "PDF Document",
              fileSize: "145 KB",
              date: inv.issueDate,
              invoiceId: inv.id,
            });
          });
        }

        if (payRes.success && payRes.data) {
          payRes.data.payments
            .filter((p) => p.status === "completed")
            .forEach((p) => {
              items.push({
                id: `doc-rct-${p.id}`,
                name: `Official Receipt ${p.paymentNumber}.pdf`,
                category: "receipt",
                fileType: "PDF Receipt",
                fileSize: "98 KB",
                date: p.paymentDate,
                paymentId: p.id,
              });
            });
        }

        setDocuments(items);
      } catch (err) {
        console.error("Failed to load documents:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDocuments();
  }, []);

  const handleDownload = async (doc: DocumentItem) => {
    if (doc.category === "receipt" && doc.paymentId) {
      const res = await getPaymentDetailsAction(doc.paymentId);
      if (res.success && res.data?.receipt) {
        setSelectedReceipt(res.data.receipt);
        return;
      }
    }

    if (doc.invoiceId) {
      window.open(`/client/invoices/${doc.invoiceId}`, "_blank");
    } else {
      toast.info("Document Download", { description: `Preparing download for ${doc.name}...` });
    }
  };

  const filtered = filter === "all" ? documents : documents.filter((d) => d.category === filter);

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Document & File Vault"
        description="Access and download your paid receipts, enterprise invoices, and contract files."
        badge={<StatusBadge status="active" customLabel={`${documents.length} Records Vaulted`} />}
      />

      {/* Category Filter */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50 w-fit flex-wrap">
        {(["all", "invoice", "receipt", "contract"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All Files" : `${cat}s`}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border/60 rounded-xl">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No document records found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((doc) => (
            <Card key={doc.id} variant="glass" className="p-4 flex items-center gap-4 group hover:border-primary/20 transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50 border border-border shrink-0">
                {doc.category === "receipt" ? (
                  <Receipt className="h-5 w-5 text-emerald-500" />
                ) : (
                  <FileText className="h-5 w-5 text-blue-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{doc.fileType}</Badge>
                  <span className="text-[11px] text-muted-foreground">{doc.fileSize}</span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(doc.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="shrink-0 text-xs h-8 gap-1"
                onClick={() => handleDownload(doc)}
              >
                {doc.category === "receipt" ? <Printer className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                {doc.category === "receipt" ? "View Receipt" : "View PDF"}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />
    </PageContainer>
  );
}
