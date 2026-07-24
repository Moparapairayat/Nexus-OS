"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { getClientProfileAction, updateClientProfileAction } from "@/features/clients/actions/profile-actions";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Building2, Phone, Globe, Clock, Key, Save } from "lucide-react";

export default function ClientProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", timezone: "UTC", language: "en" });

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await getClientProfileAction();
        if (res.success && res.data) {
          setProfile(res.data);
          setForm({
            fullName: res.data.fullName || "",
            phone: res.data.phone || "",
            timezone: res.data.timezone || "UTC",
            language: res.data.language || "en",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateClientProfileAction(form);
      if (res.success) {
        toast.success("Profile Updated!", { description: res.message });
      }
    } catch (err: any) {
      toast.error("Update Failed", { description: err?.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title="My Profile"
        description="View and manage your personal details, contact information, and account preferences."
        badge={<StatusBadge status="active" customLabel="Account Active" />}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <Card variant="glass" className="p-6 col-span-1 flex flex-col items-center text-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-xl shadow-blue-500/20">
              {profile?.fullName?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">{profile?.fullName || "—"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{profile?.email}</p>
              <p className="text-xs text-muted-foreground">{profile?.companyName || "—"}</p>
            </div>
            <div className="flex flex-col items-center gap-2 w-full text-xs text-muted-foreground border-t border-border/50 pt-4">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                <span>{profile?.timezone || "UTC"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</span>
              </div>
            </div>
            <Link href="/change-password" className="w-full">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <Key className="mr-1.5 h-3.5 w-3.5" /> Change Password
              </Button>
            </Link>
          </Card>

          {/* Edit Profile Form */}
          <Card variant="glass" className="p-6 col-span-1 lg:col-span-2">
            <CardHeader className="p-0 pb-5">
              <CardTitle className="text-base">Edit Profile Information</CardTitle>
              <CardDescription className="text-xs">Update your contact details and account preferences.</CardDescription>
            </CardHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <FormField>
                <FormLabel htmlFor="fullName">Full Name</FormLabel>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  icon={<User className="h-4 w-4" />}
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="email">Email Address</FormLabel>
                <Input
                  id="email"
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  value={profile?.email || ""}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Email address cannot be changed. Contact administrator.</p>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField>
                  <FormLabel htmlFor="phone">Phone Number</FormLabel>
                  <Input
                    id="phone"
                    placeholder="+1 234 567 8900"
                    icon={<Phone className="h-4 w-4" />}
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="timezone">Timezone</FormLabel>
                  <Select
                    id="timezone"
                    value={form.timezone}
                    onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                    options={[
                      { value: "UTC", label: "UTC" },
                      { value: "Asia/Dhaka", label: "Asia/Dhaka (UTC+6)" },
                      { value: "America/New_York", label: "America/New_York (EST)" },
                      { value: "Europe/London", label: "Europe/London (GMT)" },
                      { value: "Asia/Dubai", label: "Asia/Dubai (UTC+4)" },
                      { value: "Asia/Singapore", label: "Asia/Singapore (UTC+8)" },
                    ]}
                  />
                </FormField>
              </div>

              <FormField>
                <FormLabel htmlFor="language">Preferred Language</FormLabel>
                <Select
                  id="language"
                  value={form.language}
                  onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                  options={[
                    { value: "en", label: "English" },
                    { value: "bn", label: "Bengali (বাংলা)" },
                    { value: "ar", label: "Arabic (العربية)" },
                    { value: "fr", label: "French (Français)" },
                  ]}
                />
              </FormField>

              <div className="pt-4 border-t border-border/60 space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Notification Preferences</h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 cursor-pointer">
                    <div>
                      <span className="font-semibold text-foreground block">Billing & Invoice Alerts</span>
                      <span className="text-[11px] text-muted-foreground">Receive instant notifications when new invoices are generated or paid.</span>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 cursor-pointer">
                    <div>
                      <span className="font-semibold text-foreground block">Renewal Expiration Reminders</span>
                      <span className="text-[11px] text-muted-foreground">Get alerted 30 days and 7 days prior to service expiration.</span>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 cursor-pointer">
                    <div>
                      <span className="font-semibold text-foreground block">Support Ticket Replies</span>
                      <span className="text-[11px] text-muted-foreground">Notify me when support staff replies to an open ticket.</span>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="glow" size="sm" isLoading={isSaving} className="text-xs px-6">
                  <Save className="mr-1.5 h-3.5 w-3.5" /> Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
