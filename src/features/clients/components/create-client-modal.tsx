"use client";

import React, { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createClientAction } from "../actions/client-actions";
import { User, Building2, Mail, Phone, Globe, MapPin, Tag } from "lucide-react";

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateClientModal({ isOpen, onClose, onSuccess }: CreateClientModalProps) {
  const { toast, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    whatsapp: "",
    website: "",
    industry: "Enterprise SaaS",
    businessRegNo: "",
    billingAddress: "",
    country: "United States",
    city: "",
    postalCode: "",
    taxNumber: "",
    preferredCurrency: "USD",
    preferredLanguage: "en",
    timezone: "UTC",
    clientStatus: "active",
    tags: "VIP, Agency",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const tagArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await createClientAction({
        ...formData,
        tags: tagArray,
      });

      if (!result.success || !("data" in result) || !result.data) {
        const errDetail = (result as any).fieldErrors
          ? Object.values((result as any).fieldErrors).flat().join(" ")
          : (result as any).error || "Failed to create client record.";
        setErrorMessage(errDetail);
        toastError("Creation Failed", errDetail);
        return;
      }

      toast.success("Client Record Created!", {
        description: `${formData.companyName} profile initialized.`,
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
      title="Create New Client Profile"
      description="Add a new client organization, primary contact details, and tax preferences."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 pb-6">
        {errorMessage && <FormError>{errorMessage}</FormError>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="name">Primary Contact Name *</FormLabel>
            <Input
              id="name"
              placeholder="e.g. Johnathan Miller"
              icon={<User className="h-4 w-4" />}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="companyName">Company / Organization *</FormLabel>
            <Input
              id="companyName"
              placeholder="e.g. Acme Corp"
              icon={<Building2 className="h-4 w-4" />}
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="email">Primary Email *</FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="contact@acme.com"
              icon={<Mail className="h-4 w-4" />}
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="phone">Phone Number</FormLabel>
            <Input
              id="phone"
              placeholder="+1 (555) 000-0000"
              icon={<Phone className="h-4 w-4" />}
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="country">Country *</FormLabel>
            <Select
              id="country"
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              options={[
                { value: "United States", label: "United States" },
                { value: "United Kingdom", label: "United Kingdom" },
                { value: "United Arab Emirates", label: "United Arab Emirates" },
                { value: "Germany", label: "Germany" },
                { value: "Canada", label: "Canada" },
                { value: "Australia", label: "Australia" },
              ]}
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="preferredCurrency">Preferred Currency</FormLabel>
            <Select
              id="preferredCurrency"
              value={formData.preferredCurrency}
              onChange={(e) => handleChange("preferredCurrency", e.target.value)}
              options={[
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
                { value: "AED", label: "AED (د.إ)" },
              ]}
            />
          </FormField>
        </div>

        <FormField>
          <FormLabel htmlFor="website">Website</FormLabel>
          <Input
            id="website"
            placeholder="https://acme.com"
            icon={<Globe className="h-4 w-4" />}
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
          />
        </FormField>

        <FormField>
          <FormLabel htmlFor="tags">Tags (comma separated)</FormLabel>
          <Input
            id="tags"
            placeholder="VIP, Agency, Cloudflare"
            icon={<Tag className="h-4 w-4" />}
            value={formData.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
          />
        </FormField>

        <FormField>
          <FormLabel htmlFor="notes">Initial Admin Notes</FormLabel>
          <Textarea
            id="notes"
            placeholder="Enter onboarding notes or SLA agreement terms..."
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={3}
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="glow" size="sm" isLoading={isLoading}>
            Create Client Profile
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
