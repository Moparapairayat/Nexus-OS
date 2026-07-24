"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormField, FormLabel } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { CompanyInfo } from "@/types/setup";
import { Building2, Globe, Mail, MapPin, ArrowRight, ArrowLeft } from "lucide-react";

interface Step3CompanyProps {
  data: CompanyInfo;
  onUpdate: (data: CompanyInfo) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step3Company({ data, onUpdate, onNext, onPrev }: Step3CompanyProps) {
  const [formData, setFormData] = useState<CompanyInfo>(data);

  const handleChange = (field: keyof CompanyInfo, value: string) => {
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
        <CardTitle className="text-xl">Company & Organization Setup</CardTitle>
        <CardDescription className="text-xs">
          Configure your enterprise company details, branding, default currency, and address.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="name">Company Name *</FormLabel>
            <Input
              id="name"
              placeholder="e.g. NexusOS Technologies Inc."
              icon={<Building2 className="h-4 w-4" />}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="email">Company Support Email *</FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="support@company.com"
              icon={<Mail className="h-4 w-4" />}
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="address">Business Address *</FormLabel>
            <Input
              id="address"
              placeholder="e.g. 100 Innovation Way, Suite 400"
              icon={<MapPin className="h-4 w-4" />}
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="country">Country *</FormLabel>
            <Input
              id="country"
              placeholder="e.g. United States"
              icon={<Globe className="h-4 w-4" />}
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="currency">Default Operating Currency *</FormLabel>
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

          <FormField>
            <FormLabel htmlFor="website">Website URL (Optional)</FormLabel>
            <Input
              id="website"
              placeholder="https://company.com"
              value={formData.website || ""}
              onChange={(e) => handleChange("website", e.target.value)}
            />
          </FormField>
        </div>

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
