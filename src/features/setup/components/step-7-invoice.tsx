"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormField, FormLabel } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceSettings } from "@/types/setup";
import { FileText, DollarSign, Calendar, Percent, ArrowRight, ArrowLeft } from "lucide-react";

interface Step7InvoiceProps {
  data: InvoiceSettings;
  onUpdate: (data: InvoiceSettings) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step7Invoice({ data, onUpdate, onNext, onPrev }: Step7InvoiceProps) {
  const [formData, setFormData] = useState<InvoiceSettings>(data);

  const handleChange = (field: keyof InvoiceSettings, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card variant="glass" className="p-6 space-y-5">
      <CardHeader className="p-0 space-y-1">
        <CardTitle className="text-xl">Financial Engine & Invoice Rules</CardTitle>
        <CardDescription className="text-xs">
          Set up automated invoice prefixes, default due terms, tax percentage, and receipt footers.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField>
            <FormLabel htmlFor="prefix">Invoice Prefix *</FormLabel>
            <Input
              id="prefix"
              placeholder="e.g. INV-2026-"
              icon={<FileText className="h-4 w-4" />}
              value={formData.prefix}
              onChange={(e) => handleChange("prefix", e.target.value)}
              className="font-mono"
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="startingNumber">Starting Sequence *</FormLabel>
            <Input
              id="startingNumber"
              type="number"
              value={formData.startingNumber}
              onChange={(e) => handleChange("startingNumber", Number(e.target.value))}
              className="font-mono"
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="dueDays">Default Due Days *</FormLabel>
            <Input
              id="dueDays"
              type="number"
              icon={<Calendar className="h-4 w-4" />}
              value={formData.dueDays}
              onChange={(e) => handleChange("dueDays", Number(e.target.value))}
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="taxRate">Default Tax Rate (%) *</FormLabel>
            <Input
              id="taxRate"
              type="number"
              step="0.1"
              icon={<Percent className="h-4 w-4" />}
              value={formData.taxRate}
              onChange={(e) => handleChange("taxRate", Number(e.target.value))}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="currency">Default Billing Currency *</FormLabel>
            <Select
              id="currency"
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              options={[
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
                { value: "BDT", label: "BDT (৳)" },
              ]}
            />
          </FormField>
        </div>

        <FormField>
          <FormLabel htmlFor="invoiceFooter">Invoice Footer & SLA Notice</FormLabel>
          <Textarea
            id="invoiceFooter"
            placeholder="e.g. Net 30. Thank you for your business! Standard SLA terms apply."
            value={formData.invoiceFooter || ""}
            onChange={(e) => handleChange("invoiceFooter", e.target.value)}
            rows={2}
          />
        </FormField>

        <div className="pt-4 border-t border-border/60 flex items-center justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onPrev} className="text-xs">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
          </Button>

          <Button type="submit" variant="glow" size="sm" className="text-xs px-6">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
