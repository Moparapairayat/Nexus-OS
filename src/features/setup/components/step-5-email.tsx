"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { EmailConfig } from "@/types/setup";
import { testEmailConfigAction } from "../actions/setup-actions";
import { useToast } from "@/hooks/use-toast";
import { Mail, Key, Send, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

interface Step5EmailProps {
  data: EmailConfig;
  onUpdate: (data: EmailConfig) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step5Email({ data, onUpdate, onNext, onPrev }: Step5EmailProps) {
  const { toast, error: toastError } = useToast();
  const [formData, setFormData] = useState<EmailConfig>(data);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(data.isVerified);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof EmailConfig, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setErrorMessage(null);
    try {
      const res = await testEmailConfigAction(formData);
      if (res.success) {
        setTestSuccess(true);
        handleChange("isVerified", true);
        toast.success("Resend Test Passed!", { description: res.message });
      } else {
        setErrorMessage(res.error || "Resend connection failed.");
        toastError("Connection Failed", res.error);
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
        <CardTitle className="text-xl">Resend Email Gateway Configuration</CardTitle>
        <CardDescription className="text-xs">
          Configure Resend API credentials for automated private client invitations and invoice notifications.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && <FormError>{errorMessage}</FormError>}

        <FormField>
          <FormLabel htmlFor="apiKey">Resend API Key *</FormLabel>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="apiKey"
              type="password"
              placeholder="re_123456789_abcdef..."
              value={formData.apiKey}
              onChange={(e) => handleChange("apiKey", e.target.value)}
              className="pl-9 font-mono"
              required
            />
          </div>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="senderName">Sender Display Name *</FormLabel>
            <Input
              id="senderName"
              placeholder="e.g. NexusOS Portal"
              value={formData.senderName}
              onChange={(e) => handleChange("senderName", e.target.value)}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="senderEmail">Sender Email Address *</FormLabel>
            <Input
              id="senderEmail"
              type="email"
              placeholder="no-reply@company.com"
              icon={<Mail className="h-4 w-4" />}
              value={formData.senderEmail}
              onChange={(e) => handleChange("senderEmail", e.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-center gap-2 text-xs">
            {testSuccess ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <Send className="h-4 w-4 text-primary shrink-0" />
            )}
            <span className="text-muted-foreground">
              {testSuccess ? "Resend credentials verified!" : "Verify credentials before continuing."}
            </span>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={handleTestConnection} isLoading={isTesting} className="text-xs">
            Test Connection
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
