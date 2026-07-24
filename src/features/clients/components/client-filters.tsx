"use client";

import React from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { ClientStatus, ClientFilters } from "@/types/client";
import { GLOBAL_COUNTRIES, GLOBAL_CURRENCIES } from "@/config/countries";
import { Filter, RotateCcw } from "lucide-react";

interface ClientFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ClientFilters;
  onApplyFilters: (newFilters: ClientFilters) => void;
  onResetFilters: () => void;
}

export function ClientFilterSheet({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: ClientFilterSheetProps) {
  const [localStatus, setLocalStatus] = React.useState<string>(filters.status || "all");
  const [localCountry, setLocalCountry] = React.useState<string>(filters.country || "");
  const [localCurrency, setLocalCurrency] = React.useState<string>(filters.currency || "");

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      status: localStatus as ClientStatus | "all",
      country: localCountry || undefined,
      currency: localCurrency || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalStatus("all");
    setLocalCountry("");
    setLocalCurrency("");
    onResetFilters();
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Client Filters"
      description="Filter clients by status, region, currency, and organization type."
    >
      <div className="flex flex-col h-full justify-between space-y-6">
        <div className="space-y-4 pt-2">
          <FormField>
            <FormLabel>Client Status</FormLabel>
            <Select
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending Verification" },
                { value: "suspended", label: "Suspended" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </FormField>

          <FormField>
            <FormLabel>Country / Region</FormLabel>
            <Select
              value={localCountry}
              onChange={(e) => setLocalCountry(e.target.value)}
              options={[{ value: "", label: "All Countries" }, ...GLOBAL_COUNTRIES]}
            />
          </FormField>

          <FormField>
            <FormLabel>Preferred Currency</FormLabel>
            <Select
              value={localCurrency}
              onChange={(e) => setLocalCurrency(e.target.value)}
              options={[{ value: "", label: "All Currencies" }, ...GLOBAL_CURRENCIES]}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Filters
          </Button>

          <Button variant="primary" size="sm" onClick={handleApply} className="text-xs px-4">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Apply Filters
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
