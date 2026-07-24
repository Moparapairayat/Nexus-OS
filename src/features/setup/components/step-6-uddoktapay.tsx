"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { UddoktaPayConfig } from "@/types/setup";
import { testUddoktaPayConfigAction } from "../actions/setup-actions";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Key, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

interface Step6UddoktaPayProps {
  data: UddoktaPayConfig;
  onUpdate: (data: UddoktaPayConfig) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step6UddoktaPay({ data, onUpdate, onNext, onPrev }: Step6UddoktaPayProps) {
  const { toast, error: toastError } = useToast();
  const [formData, setFormData] = useState<UddoktaPayConfig>(data);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(data.isVerified);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof UddoktaPayConfig, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setErrorMessage(null);
    try {
      const res = await testUddoktaPayConfigAction(formData);
      if (res.success) {
        setTestSuccess(true);
        handleChange("isVerified", true);
        toast.success("UddoktaPay Credentials Verified!", { description: res.message });
      } else {
        setErrorMessage(res.error || "UddoktaPay verification failed.");
        toastError("Verification Failed", res.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Test error.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card variant="glass" className="p-6 space-y-5">
      <CardHeader className="p-0 space-y-1">
        <CardTitle className="text-xl">UddoktaPay Gateway Configuration</CardTitle>
        <CardDescription className="text-xs">
          Configure Store ID, Signature Key, and Webhook Secret for automated invoice payment processing.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && <FormError>{errorMessage}</FormError>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="storeId">Store ID *</FormLabel>
            <Input
              id="storeId"
              placeholder="e.g. nexus_store_sandbox"
              icon={<CreditCard className="h-4 w-4" />}
              value={formData.storeId}
              onChange={(e) => handleChange("storeId", e.target.value)}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="environment">Gateway Environment *</FormLabel>
            <Select
              id="environment"
              value={formData.environment}
              onChange={(e) => handleChange("environment", e.target.value)}
              options={[
                { value: "sandbox", label: "Sandbox (Testing)" },
                { value: "production", label: "Production (Live Payments)" },
              ]}
            />
          </FormField>
        </div>

        <FormField>
          <FormLabel htmlFor="signatureKey">Signature API Key *</FormLabel>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="signatureKey"
              type="password"
              placeholder="uddoktapay_sig_99482..."
              value={formData.signatureKey}
              onChange={(e) => handleChange("signatureKey", e.target.value)}
              className="pl-9 font-mono"
              required
            />
          </div>
        </FormField>

        <FormField>
          <FormLabel htmlFor="webhookSecret">Webhook Verification Secret *</FormLabel>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="webhookSecret"
              type="password"
              placeholder="whsec_884920..."
              value={formData.webhookSecret}
              onChange={(e) => handleChange("webhookSecret", e.target.value)}
              className="pl-9 font-mono"
              required
            />
          </div>
        </FormField>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-center gap-2 text-xs">
            {testSuccess ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <CreditCard className="h-4 w-4 text-primary shrink-0" />
            )}
            <span className="text-muted-foreground">
              {testSuccess ? "UddoktaPay API credentials verified!" : "Verify credentials before continuing."}
            </span>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={handleTestConnection} isLoading={isTesting} className="text-xs">
            Verify Credentials
          </Button>
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
