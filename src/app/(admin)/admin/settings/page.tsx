"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField, FormLabel } from "@/components/ui/form";
import { Tabs } from "@/components/ui/tabs";
import {
  getSystemSettingsAction,
  updateSystemSettingsAction,
  getFeatureFlagsAction,
  toggleFeatureFlagAction,
  testGatewayConnectionAction,
  testEmailConnectionAction,
} from "@/features/settings/actions/settings-actions";
import { FullSystemSettingsPayload, FeatureFlagRecord } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Building2,
  Palette,
  FileText,
  DollarSign,
  Mail,
  ShieldCheck,
  ToggleLeft,
  CheckCircle,
  AlertCircle,
  Save,
  Zap,
  Activity,
  Globe,
  Lock,
} from "lucide-react";

export default function AdminSettingsControlCenterPage() {
  const { toast, error: toastError } = useToast();
  const [settings, setSettings] = useState<FullSystemSettingsPayload | null>(null);
  const [flags, setFlags] = useState<FeatureFlagRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingGateway, setIsTestingGateway] = useState(false);
  const [gatewayTestResult, setGatewayTestResult] = useState<any>(null);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<any>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const [stRes, flgRes] = await Promise.all([
        getSystemSettingsAction(),
        getFeatureFlagsAction(),
      ]);

      if (stRes.success && stRes.data) setSettings(stRes.data);
      if (flgRes.success && flgRes.data) setFlags(flgRes.data.flags);
    } catch (err) {
      toastError("Error", "Failed to load system control center configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveCategory = async (category: string, values: any) => {
    setIsSaving(true);
    try {
      const res = await updateSystemSettingsAction(category, values);
      if (res.success) {
        toast.success("Settings Saved!", { description: `${category.toUpperCase()} configuration updated.` });
        await fetchSettings();
      } else {
        toastError("Save Failed", res.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFlag = async (key: string, currentVal: boolean) => {
    try {
      const res = await toggleFeatureFlagAction(key, !currentVal);
      if (res.success) {
        toast.success("Feature Flag Updated");
        await fetchSettings();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    }
  };

  const handleTestGateway = async () => {
    setIsTestingGateway(true);
    try {
      const res = await testGatewayConnectionAction();
      setGatewayTestResult(res);
      if (res.success) {
        toast.success("Gateway Online", { description: res.message });
      }
    } finally {
      setIsTestingGateway(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    try {
      const res = await testEmailConnectionAction();
      setEmailTestResult(res);
      if (res.success) {
        toast.success("Email Engine Online", { description: res.message });
      }
    } finally {
      setIsTestingEmail(false);
    }
  };

  const tabItems = settings
    ? [
        {
          id: "company",
          label: "Organization & Profile",
          content: (
            <div className="pt-3 max-w-2xl space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveCategory("company", settings.company);
                }}
                className="space-y-4"
              >
                <FormField>
                  <FormLabel htmlFor="companyName">Company Name *</FormLabel>
                  <Input
                    id="companyName"
                    value={settings.company.companyName}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, companyName: e.target.value } })}
                    required
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField>
                    <FormLabel htmlFor="businessEmail">Business Email</FormLabel>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={settings.company.businessEmail}
                      onChange={(e) => setSettings({ ...settings, company: { ...settings.company, businessEmail: e.target.value } })}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="phone">Support Phone</FormLabel>
                    <Input
                      id="phone"
                      value={settings.company.phone}
                      onChange={(e) => setSettings({ ...settings, company: { ...settings.company, phone: e.target.value } })}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField>
                    <FormLabel htmlFor="timezone">Timezone</FormLabel>
                    <Select
                      id="timezone"
                      value={settings.company.timezone}
                      onChange={(e) => setSettings({ ...settings, company: { ...settings.company, timezone: e.target.value } })}
                      options={[
                        { value: "Asia/Dhaka", label: "Asia/Dhaka (UTC+6)" },
                        { value: "UTC", label: "UTC" },
                        { value: "America/New_York", label: "America/New_York (EST)" },
                        { value: "Europe/London", label: "Europe/London (GMT)" },
                      ]}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="currency">Default Currency</FormLabel>
                    <Select
                      id="currency"
                      value={settings.company.currency}
                      onChange={(e) => setSettings({ ...settings, company: { ...settings.company, currency: e.target.value } })}
                      options={[
                        { value: "USD", label: "USD ($)" },
                        { value: "BDT", label: "BDT (৳)" },
                        { value: "EUR", label: "EUR (€)" },
                        { value: "GBP", label: "GBP (£)" },
                      ]}
                    />
                  </FormField>
                </div>

                <FormField>
                  <FormLabel htmlFor="address">Corporate Address</FormLabel>
                  <Input
                    id="address"
                    value={settings.company.address}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, address: e.target.value } })}
                  />
                </FormField>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="glow" size="sm" isLoading={isSaving}>
                    <Save className="mr-1.5 h-3.5 w-3.5" /> Save Company Profile
                  </Button>
                </div>
              </form>
            </div>
          ),
        },
        {
          id: "invoices",
          label: "Invoice & Billing Rules",
          content: (
            <div className="pt-3 max-w-2xl space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveCategory("invoices", settings.invoices);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField>
                    <FormLabel htmlFor="invoicePrefix">Invoice Prefix *</FormLabel>
                    <Input
                      id="invoicePrefix"
                      value={settings.invoices.invoicePrefix}
                      onChange={(e) => setSettings({ ...settings, invoices: { ...settings.invoices, invoicePrefix: e.target.value } })}
                      required
                    />
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="dueDays">Due Days Window (Days)</FormLabel>
                    <Input
                      id="dueDays"
                      type="number"
                      value={settings.invoices.dueDays}
                      onChange={(e) => setSettings({ ...settings, invoices: { ...settings.invoices, dueDays: Number(e.target.value) } })}
                    />
                  </FormField>
                </div>

                <FormField>
                  <FormLabel htmlFor="footerText">Invoice Footer Terms</FormLabel>
                  <Textarea
                    id="footerText"
                    value={settings.invoices.footerText}
                    onChange={(e) => setSettings({ ...settings, invoices: { ...settings.invoices, footerText: e.target.value } })}
                    rows={3}
                  />
                </FormField>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="glow" size="sm" isLoading={isSaving}>
                    <Save className="mr-1.5 h-3.5 w-3.5" /> Save Invoice Rules
                  </Button>
                </div>
              </form>
            </div>
          ),
        },
        {
          id: "uddoktapay",
          label: "UddoktaPay Gateway Manager",
          content: (
            <div className="pt-3 max-w-2xl space-y-4">
              <Card variant="glass" className="p-4 border-emerald-500/30 bg-emerald-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-500" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">UddoktaPay Bangladesh v2 API</span>
                      <span className="text-[11px] text-muted-foreground">Official single payment gateway provider.</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" isLoading={isTestingGateway} onClick={handleTestGateway} className="text-xs">
                    Test Connection
                  </Button>
                </div>

                {gatewayTestResult && (
                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-background text-xs space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-bold text-emerald-500">{gatewayTestResult.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Handshake Latency:</span>
                      <span className="font-bold text-foreground">{gatewayTestResult.latencyMs} ms</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] pt-1">{gatewayTestResult.message}</p>
                  </div>
                )}
              </Card>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveCategory("uddoktapay", settings.uddoktapay);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField>
                    <FormLabel htmlFor="storeId">Store ID *</FormLabel>
                    <Input
                      id="storeId"
                      value={settings.uddoktapay.storeId}
                      onChange={(e) => setSettings({ ...settings, uddoktapay: { ...settings.uddoktapay, storeId: e.target.value } })}
                      required
                    />
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="apiKey">API Key *</FormLabel>
                    <Input
                      id="apiKey"
                      type="password"
                      value={settings.uddoktapay.apiKey}
                      onChange={(e) => setSettings({ ...settings, uddoktapay: { ...settings.uddoktapay, apiKey: e.target.value } })}
                      required
                    />
                  </FormField>
                </div>

                <FormField>
                  <FormLabel htmlFor="baseUrl">Base API Endpoint URL</FormLabel>
                  <Input
                    id="baseUrl"
                    value={settings.uddoktapay.baseUrl}
                    onChange={(e) => setSettings({ ...settings, uddoktapay: { ...settings.uddoktapay, baseUrl: e.target.value } })}
                  />
                </FormField>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="glow" size="sm" isLoading={isSaving}>
                    <Save className="mr-1.5 h-3.5 w-3.5" /> Save Gateway Settings
                  </Button>
                </div>
              </form>
            </div>
          ),
        },
        {
          id: "flags",
          label: "Feature Flags & Modules",
          content: (
            <div className="pt-3 max-w-2xl space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Module Toggles & Feature Flags</h4>
              
              <div className="space-y-2">
                {flags.map((flag) => (
                  <div key={flag.id} className="p-4 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{flag.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-muted text-muted-foreground uppercase">
                          {flag.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{flag.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFlag(flag.key, flag.isEnabled)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        flag.isEnabled ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {flag.isEnabled ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ),
        },
      ]
    : [];

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="System Control Center & Global Settings"
        description="Operational settings, UddoktaPay credentials, invoice rules, feature flags, and API status."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Card variant="glass" className="p-5">
          <Tabs items={tabItems} defaultTabId="company" />
        </Card>
      )}
    </PageContainer>
  );
}
