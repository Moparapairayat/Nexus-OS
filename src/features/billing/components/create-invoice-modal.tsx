"use client";

import React, { useState, useEffect } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createInvoiceAction } from "../actions/billing-actions";
import { BillingType } from "@/types/billing";
import { Client } from "@/types/client";
import { FileText, Plus, Trash2, DollarSign, Calendar, AlertCircle } from "lucide-react";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSuccess: () => void;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  clients,
  onSuccess,
}: CreateInvoiceModalProps) {
  const { toast, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    clientId: "",
    billingType: "one_time" as BillingType,
    dueDate: defaultDueDate,
    currency: "USD",
    taxRate: 5,
    discountAmount: 0,
    notes: "",
    clientNotes: "Thank you for your business!",
    terms: "Net 30. Standard Enterprise Service SLA applies.",
  });

  // Auto-set clientId when clients load
  useEffect(() => {
    if (clients.length > 0 && !formData.clientId) {
      setFormData((prev) => ({ ...prev, clientId: clients[0].id }));
    }
  }, [clients]);

  const [items, setItems] = useState([
    {
      title: "Managed Infrastructure & Retainer Service",
      description: "Monthly cloud hosting, security monitoring, and SLA maintenance.",
      quantity: 1,
      unitPrice: 499.0,
      discount: 0,
      taxRate: 5,
    },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        quantity: 1,
        unitPrice: 100.0,
        discount: 0,
        taxRate: formData.taxRate,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await createInvoiceAction({
        ...formData,
        taxRate: Number(formData.taxRate),
        discountAmount: Number(formData.discountAmount),
        items: items.map((i) => ({
          ...i,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          discount: Number(i.discount),
          taxRate: Number(i.taxRate),
        })),
      });

      if (!result.success || !("data" in result) || !result.data) {
        setErrorMessage((result as any).error || "Failed to generate invoice.");
        toastError("Generation Failed", (result as any).error);
        return;
      }

      const invData = result.data as any;
      toast.success("Invoice Generated!", {
        description: `${invData.invoiceNumber} created for ${invData.companyName}.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const computedSubtotal = items.reduce((acc, i) => acc + i.quantity * i.unitPrice - i.discount, 0);
  const computedTax = (computedSubtotal * formData.taxRate) / 100;
  const computedGrandTotal = computedSubtotal + computedTax - formData.discountAmount;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Generate New Invoice"
      description="Create an itemized financial invoice with tax rules and terms."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 pb-6">
        {errorMessage && <FormError>{errorMessage}</FormError>}

        {clients.length === 0 ? (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">No Clients Registered</p>
              <p className="mt-0.5 text-muted-foreground">You must create at least one client organization before generating invoices.</p>
            </div>
          </div>
        ) : (
          <FormField>
            <FormLabel htmlFor="clientId">Target Client Account *</FormLabel>
            <Select
              id="clientId"
              value={formData.clientId}
              onChange={(e) => setFormData((prev) => ({ ...prev, clientId: e.target.value }))}
              options={clients.map((c) => ({ value: c.id, label: `${c.companyName} (${c.name})` }))}
              required
            />
          </FormField>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField>
            <FormLabel htmlFor="billingType">Billing Type</FormLabel>
            <Select
              id="billingType"
              value={formData.billingType}
              onChange={(e) => setFormData((prev) => ({ ...prev, billingType: e.target.value as BillingType }))}
              options={[
                { value: "one_time", label: "One-Time" },
                { value: "recurring", label: "Recurring" },
                { value: "renewal", label: "Renewal" },
                { value: "manual", label: "Manual" },
              ]}
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="dueDate">Due Date *</FormLabel>
            <Input
              id="dueDate"
              type="date"
              icon={<Calendar className="h-4 w-4" />}
              value={formData.dueDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="taxRate">Tax Rate (%)</FormLabel>
            <Input
              id="taxRate"
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData((prev) => ({ ...prev, taxRate: Number(e.target.value) }))}
            />
          </FormField>
        </div>

        {/* Line Items Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Itemized Line Items</span>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="h-7 text-xs px-2">
              <Plus className="mr-1 h-3 w-3" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="p-3 rounded-xl border border-border/80 bg-muted/40 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    placeholder="Item title (e.g. Monthly Web Retainer)"
                    value={item.title}
                    onChange={(e) => handleItemChange(index, "title", e.target.value)}
                    required
                    className="h-8 text-xs font-semibold"
                  />
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Qty</label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Unit Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", Number(e.target.value))}
                      className="h-8 text-xs font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Subtotal</label>
                    <div className="h-8 flex items-center px-2 font-mono font-bold text-foreground bg-background/50 rounded-xl border border-input text-xs">
                      ${(item.quantity * item.unitPrice - item.discount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Calculations Summary */}
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 space-y-1 text-xs font-mono">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span>${computedSubtotal.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax ({formData.taxRate}%):</span>
            <span>+${computedTax.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between font-bold text-foreground text-sm pt-1 border-t border-primary/20">
            <span>Grand Total Due:</span>
            <span className="text-primary">${computedGrandTotal.toFixed(2)} USD</span>
          </div>
        </div>

        <FormField>
          <FormLabel htmlFor="notes">Internal Admin Notes</FormLabel>
          <Textarea
            id="notes"
            placeholder="Enter internal billing notes or references..."
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            rows={2}
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="glow" size="sm" isLoading={isLoading}>
            Generate Invoice
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
