"use client";

import React, { useState, useEffect } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { assignClientServiceAction } from "../actions/service-actions";
import { ServiceCategory, ServiceTemplate, BillingCycle } from "@/types/service";
import { Client } from "@/types/client";
import { Package, Globe, Server, DollarSign, Tag, AlertCircle } from "lucide-react";

interface AssignServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  categories: ServiceCategory[];
  templates: ServiceTemplate[];
  onSuccess: () => void;
}

export function AssignServiceModal({
  isOpen,
  onClose,
  clients,
  categories,
  templates,
  onSuccess,
}: AssignServiceModalProps) {
  const { toast, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientId: "",
    templateId: "",
    customName: "",
    categoryId: "",
    customPrice: 49.0,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    domainName: "",
    serverIp: "",
    cloudflareZoneId: "",
    autoRenewal: true,
    serviceStatus: "active",
    internalNotes: "",
    tags: "VIP, Managed",
  });

  // Ensure default clientId and categoryId are always set when options load
  useEffect(() => {
    if (clients.length > 0 && !formData.clientId) {
      setFormData((prev) => ({ ...prev, clientId: clients[0].id }));
    }
  }, [clients]);

  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleTemplateSelect = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      setFormData((prev) => ({
        ...prev,
        templateId: tmpl.id,
        customName: tmpl.name,
        categoryId: tmpl.categoryId,
        customPrice: tmpl.defaultPrice,
        currency: tmpl.currency,
        billingCycle: tmpl.billingCycle,
        tags: tmpl.tags.join(", "),
      }));
    } else {
      setFormData((prev) => ({ ...prev, templateId: "" }));
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!formData.clientId) {
        setErrorMessage("Please select a target client account. If none exist, create a client first.");
        setIsLoading(false);
        return;
      }

      if (!formData.categoryId) {
        setErrorMessage("Please select an asset category.");
        setIsLoading(false);
        return;
      }

      const tagArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await assignClientServiceAction({
        ...formData,
        customPrice: Number(formData.customPrice),
        tags: tagArray,
      });

      if (!result.success || !result.data) {
        const errDetail = (result as any).fieldErrors
          ? Object.values((result as any).fieldErrors).flat().join(" ")
          : result.error || "Failed to assign service asset.";

        setErrorMessage(errDetail);
        toastError("Assignment Failed", errDetail);
        return;
      }

      toast.success("Digital Asset Assigned!", {
        description: `${formData.customName} provisioned successfully.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Digital Asset / Service"
      description="Provision a new digital asset, domain, hosting, or retainer to a client."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 pb-6">
        {errorMessage && <FormError>{errorMessage}</FormError>}

        {clients.length === 0 ? (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">No Clients Registered</p>
              <p className="mt-0.5 text-muted-foreground">You must create at least one client organization before assigning digital assets.</p>
            </div>
          </div>
        ) : (
          <FormField>
            <FormLabel htmlFor="clientId">Target Client Account *</FormLabel>
            <Select
              id="clientId"
              value={formData.clientId}
              onChange={(e) => handleChange("clientId", e.target.value)}
              options={clients.map((c) => ({ value: c.id, label: `${c.companyName} (${c.name})` }))}
              required
            />
          </FormField>
        )}

        {templates.length > 0 && (
          <FormField>
            <FormLabel htmlFor="templateId">Select Catalog Template (Optional)</FormLabel>
            <Select
              id="templateId"
              value={formData.templateId}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              options={[
                { value: "", label: "Custom Asset / Manual Setup" },
                ...templates.map((t) => ({ value: t.id, label: `${t.name} ($${t.defaultPrice}/${t.billingCycle})` })),
              ]}
            />
          </FormField>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="customName">Asset / Service Title *</FormLabel>
            <Input
              id="customName"
              placeholder="e.g. acme.com Managed Domain"
              icon={<Package className="h-4 w-4" />}
              value={formData.customName}
              onChange={(e) => handleChange("customName", e.target.value)}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="categoryId">Asset Category *</FormLabel>
            <Select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="customPrice">Recurring Cost *</FormLabel>
            <Input
              id="customPrice"
              type="number"
              step="0.01"
              icon={<DollarSign className="h-4 w-4" />}
              value={formData.customPrice}
              onChange={(e) => handleChange("customPrice", e.target.value)}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="billingCycle">Billing Cycle *</FormLabel>
            <Select
              id="billingCycle"
              value={formData.billingCycle}
              onChange={(e) => handleChange("billingCycle", e.target.value)}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual" },
                { value: "quarterly", label: "Quarterly" },
                { value: "semi_annual", label: "Semi-Annual" },
                { value: "one_time", label: "One-Time" },
              ]}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="domainName">Domain Name (Optional)</FormLabel>
            <Input
              id="domainName"
              placeholder="e.g. clientdomain.com"
              icon={<Globe className="h-4 w-4" />}
              value={formData.domainName}
              onChange={(e) => handleChange("domainName", e.target.value)}
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="serverIp">Server IP / Endpoint</FormLabel>
            <Input
              id="serverIp"
              placeholder="e.g. 104.21.44.18"
              icon={<Server className="h-4 w-4" />}
              value={formData.serverIp}
              onChange={(e) => handleChange("serverIp", e.target.value)}
            />
          </FormField>
        </div>

        <FormField>
          <FormLabel htmlFor="tags">Tags (comma separated)</FormLabel>
          <Input
            id="tags"
            placeholder="VIP, Hosting, Managed"
            icon={<Tag className="h-4 w-4" />}
            value={formData.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
          />
        </FormField>

        <FormField>
          <FormLabel htmlFor="internalNotes">Internal Setup Notes</FormLabel>
          <Textarea
            id="internalNotes"
            placeholder="Enter technical setup notes, API keys, or provisioning instructions..."
            value={formData.internalNotes}
            onChange={(e) => handleChange("internalNotes", e.target.value)}
            rows={3}
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="glow" size="sm" isLoading={isLoading} disabled={clients.length === 0}>
            Assign Asset
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
