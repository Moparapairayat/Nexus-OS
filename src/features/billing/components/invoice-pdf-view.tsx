"use client";

import React from "react";
import { Invoice } from "@/types/billing";
import { siteConfig } from "@/config/site";
import { StatusBadge } from "@/components/ui/status-badge";
import { Boxes, QrCode } from "lucide-react";

interface InvoicePdfViewProps {
  invoice: Invoice;
}

export function InvoicePdfView({ invoice }: InvoicePdfViewProps) {
  return (
    <div className="w-full bg-card text-card-foreground rounded-2xl border border-border/80 p-6 md:p-10 shadow-2xl space-y-8 print:border-none print:shadow-none print:p-0">
      {/* Invoice Document Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{siteConfig.name}</h2>
            <p className="text-xs text-muted-foreground">{siteConfig.company.name} &bull; Financial Engine</p>
          </div>
        </div>

        <div className="text-left sm:text-right space-y-1">
          <div className="flex items-center sm:justify-end gap-2">
            <span className="text-lg font-bold font-mono text-primary">{invoice.invoiceNumber}</span>
            <StatusBadge status={invoice.invoiceStatus as any} />
          </div>
          <p className="text-xs text-muted-foreground">
            Issued: <strong className="text-foreground">{new Date(invoice.issueDate).toLocaleDateString()}</strong> &bull; Due:{" "}
            <strong className="text-foreground">{new Date(invoice.dueDate).toLocaleDateString()}</strong>
          </p>
        </div>
      </div>

      {/* Bill From & Bill To Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div className="space-y-1 p-4 rounded-xl bg-muted/30 border border-border/40">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Billed From</span>
          <p className="font-bold text-foreground text-sm">{siteConfig.company.name}</p>
          <p className="text-muted-foreground">100 Innovation Way, Suite 400, San Francisco, CA 94105</p>
          <p className="text-muted-foreground">{siteConfig.company.supportEmail}</p>
          <p className="text-muted-foreground">Tax ID: US-883920194</p>
        </div>

        <div className="space-y-1 p-4 rounded-xl bg-muted/30 border border-border/40">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Billed To</span>
          <p className="font-bold text-foreground text-sm">{invoice.companyName}</p>
          <p className="text-muted-foreground">Attn: {invoice.clientName}</p>
          <p className="text-muted-foreground">{invoice.clientEmail}</p>
          <p className="text-muted-foreground">{invoice.billingAddress}</p>
        </div>
      </div>

      {/* Itemized Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/80 text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted/40">
              <th className="py-3 px-3 rounded-l-xl">Description / Asset</th>
              <th className="py-3 px-3 text-center">Qty</th>
              <th className="py-3 px-3 text-right">Unit Price</th>
              <th className="py-3 px-3 text-right rounded-r-xl">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-medium">
            {invoice.items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-3.5 px-3">
                  <span className="font-semibold text-foreground block">{item.title}</span>
                  {item.description && <span className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</span>}
                </td>
                <td className="py-3.5 px-3 text-center font-mono">{item.quantity}</td>
                <td className="py-3.5 px-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                <td className="py-3.5 px-3 text-right font-mono font-bold text-foreground">
                  ${item.subtotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Totals & Payment Instructions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/80 text-xs">
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Payment & Receipt Info</span>
            <p className="text-muted-foreground text-[11px]">
              {invoice.clientNotes || "Please remit payment before the due date."}
            </p>
            <div className="flex items-center gap-2 pt-2 text-[10px] text-muted-foreground">
              <QrCode className="h-4 w-4 text-primary shrink-0" />
              <span>Digital Receipt Verification & Signature Active</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 font-mono text-xs text-right sm:pl-8">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)} {invoice.currency}</span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Tax ({invoice.taxRate}%):</span>
              <span>+${invoice.taxAmount.toFixed(2)} {invoice.currency}</span>
            </div>
          )}
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-500">
              <span>Discount:</span>
              <span>-${invoice.discountAmount.toFixed(2)} {invoice.currency}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-foreground text-sm pt-2 border-t border-border/80">
            <span>Grand Total:</span>
            <span className="text-primary">${invoice.grandTotal.toFixed(2)} {invoice.currency}</span>
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span className="text-muted-foreground">Balance Due:</span>
            <span className={invoice.balanceDue > 0 ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
              ${invoice.balanceDue.toFixed(2)} {invoice.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Terms & Footer */}
      <div className="pt-6 border-t border-border/60 text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Terms: {invoice.terms || "Net 30. Standard Enterprise Service SLA applies."}</span>
        <span>Generated by NexusOS Financial Engine</span>
      </div>
    </div>
  );
}
