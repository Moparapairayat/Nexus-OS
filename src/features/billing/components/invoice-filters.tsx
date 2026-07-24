"use client";

import React, { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { InvoiceStatus, BillingType, InvoiceFilters } from "@/types/billing";
import { Filter, RotateCcw } from "lucide-react";

interface InvoiceFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: InvoiceFilters;
  onApplyFilters: (newFilters: InvoiceFilters) => void;
  onResetFilters: () => void;
}

export function InvoiceFilterSheet({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: InvoiceFilterSheetProps) {
  const [localStatus, setLocalStatus] = useState<string>(filters.status || "all");
  const [localBillingType, setLocalBillingType] = useState<string>(filters.billingType || "all");
  const [localCurrency, setLocalCurrency] = useState<string>(filters.currency || "");

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      status: localStatus as InvoiceStatus | "all",
      billingType: localBillingType as BillingType | "all",
      currency: localCurrency || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalStatus("all");
    setLocalBillingType("all");
    setLocalCurrency("");
    onResetFilters();
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Invoice Filters"
      description="Filter financial records by invoice status, billing type, or currency."
    >
      <div className="flex flex-col h-full justify-between space-y-6">
        <div className="space-y-4 pt-2">
          <FormField>
            <FormLabel>Invoice Status</FormLabel>
            <Select
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending Payment" },
                { value: "overdue", label: "Overdue" },
                { value: "draft", label: "Draft" },
                { value: "cancelled", label: "Cancelled" },
                { value: "void", label: "Void" },
              ]}
            />
          </FormField>

          <FormField>
            <FormLabel>Billing Type</FormLabel>
            <Select
              value={localBillingType}
              onChange={(e) => setLocalBillingType(e.target.value)}
              options={[
                { value: "all", label: "All Types" },
                { value: "one_time", label: "One-Time Invoice" },
                { value: "recurring", label: "Recurring Subscription" },
                { value: "renewal", label: "Renewal Invoice" },
                { value: "manual", label: "Manual Invoice" },
              ]}
            />
          </FormField>

          <FormField>
            <FormLabel>Currency</FormLabel>
            <Select
              value={localCurrency}
              onChange={(e) => setLocalCurrency(e.target.value)}
              options={[
                { value: "", label: "All Currencies" },
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
              ]}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
          </Button>

          <Button variant="primary" size="sm" onClick={handleApply} className="text-xs px-4">
            <Filter className="mr-1.5 h-3.5 w-3.5" /> Apply Filters
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
