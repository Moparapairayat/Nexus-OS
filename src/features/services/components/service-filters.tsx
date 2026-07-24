"use client";

import React, { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { ServiceStatus, BillingCycle, ServiceCategory, ServiceFilters } from "@/types/service";
import { Filter, RotateCcw } from "lucide-react";

interface ServiceFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ServiceCategory[];
  filters: ServiceFilters;
  onApplyFilters: (newFilters: ServiceFilters) => void;
  onResetFilters: () => void;
}

export function ServiceFilterSheet({
  isOpen,
  onClose,
  categories,
  filters,
  onApplyFilters,
  onResetFilters,
}: ServiceFilterSheetProps) {
  const [localStatus, setLocalStatus] = useState<string>(filters.status || "all");
  const [localCategoryId, setLocalCategoryId] = useState<string>(filters.categoryId || "");
  const [localBillingCycle, setLocalBillingCycle] = useState<string>(filters.billingCycle || "all");

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      status: localStatus as ServiceStatus | "all",
      categoryId: localCategoryId || undefined,
      billingCycle: localBillingCycle as BillingCycle | "all",
    });
    onClose();
  };

  const handleReset = () => {
    setLocalStatus("all");
    setLocalCategoryId("");
    setLocalBillingCycle("all");
    onResetFilters();
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Digital Assets & Services"
      description="Filter asset inventory by category, service status, or billing cycle."
    >
      <div className="flex flex-col h-full justify-between space-y-6">
        <div className="space-y-4 pt-2">
          <FormField>
            <FormLabel>Asset Category</FormLabel>
            <Select
              value={localCategoryId}
              onChange={(e) => setLocalCategoryId(e.target.value)}
              options={[
                { value: "", label: "All Asset Categories" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </FormField>

          <FormField>
            <FormLabel>Asset Status</FormLabel>
            <Select
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "provisioning", label: "Provisioning" },
                { value: "pending", label: "Pending Setup" },
                { value: "suspended", label: "Suspended" },
                { value: "expired", label: "Expired" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
          </FormField>

          <FormField>
            <FormLabel>Billing Cycle</FormLabel>
            <Select
              value={localBillingCycle}
              onChange={(e) => setLocalBillingCycle(e.target.value)}
              options={[
                { value: "all", label: "All Cycles" },
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual" },
                { value: "quarterly", label: "Quarterly" },
                { value: "one_time", label: "One-Time" },
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
