"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateServiceAction } from "../actions/service-actions";
import { getServiceCategoriesAction } from "../actions/service-actions";
import { ServiceCategory, BillingCycle } from "@/types/service";
import { UpdateServiceValues } from "../schemas/service-schema";
import {
  Save,
  X,
  Globe,
  Server,
  Cloud,
  Tag,
  FileText,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

interface EditServiceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    customName: string;
    categoryId: string;
    customPrice: number;
    currency: string;
    billingCycle: BillingCycle;
    domainName?: string;
    serverIp?: string;
    cloudflareZoneId?: string;
    autoRenewal: boolean;
    renewalDate?: string;
    serviceStatus: string;
    internalNotes?: string;
    clientNotes?: string;
    tags: string[];
  };
  categories: ServiceCategory[];
  onSuccess: () => void;
}

export function EditServiceSheet({
  isOpen,
  onClose,
  service,
  categories: propCategories,
  onSuccess,
}: EditServiceSheetProps) {
  const { toast, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>(propCategories);

  useEffect(() => {
    setCategories(propCategories);
  }, [propCategories, isOpen]);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      getServiceCategoriesAction().then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      });
    }
  }, [isOpen, categories.length]);

  const [form, setForm] = useState<UpdateServiceValues>({
    customName: service.customName,
    categoryId: service.categoryId,
    customPrice: service.customPrice,
    currency: service.currency,
    billingCycle: service.billingCycle,
    domainName: service.domainName || "",
    serverIp: service.serverIp || "",
    cloudflareZoneId: service.cloudflareZoneId || "",
    autoRenewal: service.autoRenewal,
    renewalDate: service.renewalDate || "",
    serviceStatus: service.serviceStatus as any,
    internalNotes: service.internalNotes || "",
    clientNotes: service.clientNotes || "",
    tags: service.tags || [],
  });

  const MONTH_NAMES_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

  const renewalDateValue = useMemo(() => {
    if (!service.renewalDate) return;
    const d = new Date(service.renewalDate + "T00:00:00");
    return { month: d.getMonth(), year: d.getFullYear(), day: d.getDate() };
  }, [service.renewalDate]);

  const [selMonth, setSelMonth] = useState<number>(renewalDateValue?.month ?? new Date().getMonth());
  const [selYear, setSelYear] = useState<number>(renewalDateValue?.year ?? new Date().getFullYear());
  const [selDay, setSelDay] = useState<string>(String(renewalDateValue?.day ?? 1));

  const monthOptions = useMemo(
    () =>
      MONTH_NAMES_SHORT.map((name, idx) => ({
        value: String(idx),
        label: name,
      })),
    []
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const options: { value: string; label: string }[] = [];
    for (let y = currentYear; y <= currentYear + 10; y++) {
      options.push({ value: String(y), label: String(y) });
    }
    return options;
  }, []);

  const dayOptions = useMemo(() => {
    const maxDay = getDaysInMonth(selMonth, selYear);
    const days: { value: string; label: string }[] = [];
    for (let d = 1; d <= maxDay; d++) {
      days.push({ value: String(d), label: String(d) });
    }
    return days;
  }, [selMonth, selYear]);

  const syncRenewalDateToForm = () => {
    const m = parseInt(String(selMonth), 10);
    const y = parseInt(String(selYear), 10);
    const maxDay = getDaysInMonth(m, y);
    const clampedDay = Math.min(parseInt(selDay, 10), maxDay);
    const monthStr = String(m + 1).padStart(2, "0");
    const dayStr = String(clampedDay).padStart(2, "0");
    setForm((p) => ({ ...p, renewalDate: `${y}-${monthStr}-${dayStr}` }));
  };

  useEffect(() => {
    syncRenewalDateToForm();
  }, [selMonth, selYear, selDay]);

  useEffect(() => {
    if (isOpen) {
      const rd = service.renewalDate;
      const parsed = rd ? new Date(rd + "T00:00:00") : new Date();
      setSelMonth(parsed.getMonth());
      setSelYear(parsed.getFullYear());
      setSelDay(String(parsed.getDate()));
      syncRenewalDateToForm();
      setForm({
        customName: service.customName,
        categoryId: service.categoryId,
        customPrice: service.customPrice,
        currency: service.currency,
        billingCycle: service.billingCycle,
        domainName: service.domainName || "",
        serverIp: service.serverIp || "",
        cloudflareZoneId: service.cloudflareZoneId || "",
        autoRenewal: service.autoRenewal,
        renewalDate: rd || "",
        serviceStatus: service.serviceStatus as any,
        internalNotes: service.internalNotes || "",
        clientNotes: service.clientNotes || "",
        tags: service.tags || [],
      });
    }
  }, [isOpen, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateServiceAction(service.id, form);
      if (result.success) {
        toast.success("Service Updated", { description: `${form.customName} has been updated.` });
        onSuccess?.();
        onClose();
      } else {
        toastError("Update Failed", result.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message || "Failed to update service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Edit Digital Asset" description={`Update configuration for ${service.customName}`}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 pb-6">
        <FormField>
          <FormLabel htmlFor="customName">Asset / Service Name *</FormLabel>
          <Input
            id="customName"
            value={form.customName}
            onChange={(e) => setForm((p) => ({ ...p, customName: e.target.value }))}
            required
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="categoryId">Category *</FormLabel>
            <Select
              id="categoryId"
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              options={[
                { value: "", label: "Select Category..." },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="serviceStatus">Status *</FormLabel>
            <Select
              id="serviceStatus"
              value={form.serviceStatus}
              onChange={(e) => setForm((p) => ({ ...p, serviceStatus: e.target.value as any }))}
              options={[
                { value: "draft", label: "Draft" },
                { value: "pending", label: "Pending" },
                { value: "provisioning", label: "Provisioning" },
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
                { value: "expired", label: "Expired" },
                { value: "cancelled", label: "Cancelled" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField>
            <FormLabel htmlFor="customPrice">Price *</FormLabel>
            <Select
              id="customPrice"
              value={String(form.customPrice)}
              onChange={(e) => setForm((p) => ({ ...p, customPrice: Number(e.target.value) }))}
              options={[
                { value: "9.99", label: "$9.99" },
                { value: "19.99", label: "$19.99" },
                { value: "29.99", label: "$29.99" },
                { value: "49.0", label: "$49.00" },
                { value: "79.0", label: "$79.00" },
                { value: "99.0", label: "$99.00" },
                { value: "149.0", label: "$149.00" },
                { value: "199.0", label: "$199.00" },
                { value: "299.0", label: "$299.00" },
                { value: "499.0", label: "$499.00" },
                { value: "custom", label: "Custom Price..." },
              ]}
            />
            {form.customPrice === 0 && (
              <Input
                type="number"
                value={form.customPrice}
                onChange={(e) => setForm((p) => ({ ...p, customPrice: Number(e.target.value) }))}
                className="mt-2 text-xs"
                placeholder="Enter custom amount"
                required={form.customPrice === 0}
              />
            )}
          </FormField>

          <FormField>
            <FormLabel htmlFor="currency">Currency</FormLabel>
            <Select
              id="currency"
              value={form.currency}
              onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
              options={[
                { value: "USD", label: "USD ($)" },
                { value: "BDT", label: "BDT (৳)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
              ]}
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="billingCycle">Billing Cycle</FormLabel>
            <Select
              id="billingCycle"
              value={form.billingCycle}
              onChange={(e) => setForm((p) => ({ ...p, billingCycle: e.target.value as BillingCycle }))}
              options={[
                { value: "one_time", label: "One-Time" },
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
                { value: "semi_annual", label: "Semi-Annual" },
                { value: "annual", label: "Annual" },
                { value: "biennial", label: "Biennial" },
              ]}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="domainName">Primary Domain</FormLabel>
            <div className="relative">
              <Input
                id="domainName"
                value={form.domainName}
                onChange={(e) => setForm((p) => ({ ...p, domainName: e.target.value }))}
                placeholder="example.com"
                className="pl-9"
              />
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </FormField>

          <FormField>
            <FormLabel htmlFor="serverIp">Server IP</FormLabel>
            <div className="relative">
              <Input
                id="serverIp"
                value={form.serverIp}
                onChange={(e) => setForm((p) => ({ ...p, serverIp: e.target.value }))}
                placeholder="192.168.1.1"
                className="pl-9"
              />
              <Server className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="cloudflareZoneId">Cloudflare Zone ID</FormLabel>
            <div className="relative">
              <Input
                id="cloudflareZoneId"
                value={form.cloudflareZoneId}
                onChange={(e) => setForm((p) => ({ ...p, cloudflareZoneId: e.target.value }))}
                placeholder="Optional"
                className="pl-9"
              />
              <Cloud className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </FormField>

          <FormField>
            <FormLabel>Renewal Date</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={String(selMonth)}
                onChange={(e) => {
                  setSelMonth(parseInt(e.target.value, 10));
                }}
                options={monthOptions}
              />
              <Select
                value={selDay}
                onChange={(e) => {
                  setSelDay(e.target.value);
                }}
                options={dayOptions}
              />
              <Select
                value={selYear}
                onChange={(e) => {
                  setSelYear(parseInt(e.target.value, 10));
                }}
                options={yearOptions}
              />
            </div>
            <input type="hidden" readOnly value={form.renewalDate} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="autoRenewal">Auto-Renewal</FormLabel>
            <Select
              id="autoRenewal"
              value={form.autoRenewal ? "true" : "false"}
              onChange={(e) => setForm((p) => ({ ...p, autoRenewal: e.target.value === "true" }))}
              options={[
                { value: "true", label: "Enabled" },
                { value: "false", label: "Disabled" },
              ]}
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="tags">Tags (comma-separated)</FormLabel>
            <div className="relative">
              <Input
                id="tags"
                value={form.tags?.join(", ") || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="VIP, Managed, Priority"
                className="pl-9"
              />
              <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </FormField>
        </div>

        <FormField>
          <FormLabel htmlFor="internalNotes">Internal Notes</FormLabel>
          <Textarea
            id="internalNotes"
            value={form.internalNotes}
            onChange={(e) => setForm((p) => ({ ...p, internalNotes: e.target.value }))}
            placeholder="Setup notes, credentials, access details..."
            rows={3}
          />
        </FormField>

        <FormField>
          <FormLabel htmlFor="clientNotes">Client Notes</FormLabel>
          <Textarea
            id="clientNotes"
            value={form.clientNotes}
            onChange={(e) => setForm((p) => ({ ...p, clientNotes: e.target.value }))}
            placeholder="Notes visible to the client..."
            rows={2}
          />
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
            <X className="mr-1.5 h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button type="submit" variant="glow" size="sm" isLoading={isSubmitting} className="text-xs gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
