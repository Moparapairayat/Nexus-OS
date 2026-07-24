"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentReceipt } from "@/types/payment";
import { Printer, Download, CheckCircle, ShieldCheck } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PaymentReceipt | null;
}

export function ReceiptModal({ isOpen, onClose, receipt }: ReceiptModalProps) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Official Payment Receipt"
      description="Proof of transaction generated automatically by NexusOS."
    >
      <div className="space-y-6 pt-2 pb-4 text-foreground" id="receipt-printable-area">
        {/* Header Branding */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Payment Successful & Verified</h4>
              <p className="text-xs text-muted-foreground">Receipt #{receipt.receiptNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              PAID
            </span>
          </div>
        </div>

        {/* Receipt Key Info Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Issued To</span>
            <p className="font-bold text-foreground mt-0.5">{receipt.companyName}</p>
            <p className="text-muted-foreground">{receipt.clientName}</p>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Invoice Number</span>
            <p className="font-bold text-foreground mt-0.5 font-mono">{receipt.invoiceNumber}</p>
            <p className="text-muted-foreground">{new Date(receipt.issuedAt).toLocaleDateString()}</p>
          </div>

          <div className="pt-2 border-t border-border/40">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Payment Gateway</span>
            <p className="font-semibold text-foreground capitalize mt-0.5">{receipt.paymentMethod}</p>
          </div>
          <div className="pt-2 border-t border-border/40">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Transaction ID</span>
            <p className="font-semibold text-foreground font-mono mt-0.5">{receipt.transactionId || "N/A"}</p>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">Total Amount Settled</span>
            <span className="text-2xl font-black text-foreground">
              {receipt.currency} ${receipt.amount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
            Zero Balance Remaining
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60 print:hidden">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="glow" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print Receipt
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
