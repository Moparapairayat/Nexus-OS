"use client";

import React, { useState, useEffect } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormLabel } from "@/components/ui/form";
import {
  getServiceCredentialsAction,
  createServiceCredentialAction,
  toggleCredentialVisibilityAction,
  deleteServiceCredentialAction,
} from "@/features/services/actions/service-actions";
import { ServiceCredential } from "@/types/service";
import { useToast } from "@/hooks/use-toast";
import {
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
  Lock,
  ExternalLink,
  Shield,
  UserCheck,
} from "lucide-react";

interface CredentialsVaultDrawerProps {
  serviceId: string;
  serviceName: string;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export function CredentialsVaultDrawer({
  serviceId,
  serviceName,
  isOpen,
  onClose,
  isAdmin = true,
}: CredentialsVaultDrawerProps) {
  const { toast, error: toastError } = useToast();
  const [credentials, setCredentials] = useState<ServiceCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [form, setForm] = useState({
    credentialName: "Control Panel Credentials",
    username: "",
    password: "",
    loginUrl: "",
    apiKey: "",
    licenseKey: "",
    secretNotes: "",
    isClientVisible: true,
  });

  const fetchCredentials = async () => {
    if (!serviceId) return;
    setIsLoading(true);
    try {
      const res = await getServiceCredentialsAction(serviceId);
      if (res.success && res.data) {
        setCredentials(res.data);
      }
    } catch (err) {
      toastError("Error", "Failed to load service credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchCredentials();
    }
  }, [isOpen, serviceId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to Clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createServiceCredentialAction({
        serviceId,
        ...form,
      });

      if (res.success) {
        toast.success("Credentials Stored!", { description: `Added ${form.credentialName}` });
        setShowAddForm(false);
        setForm({
          credentialName: "Control Panel Credentials",
          username: "",
          password: "",
          loginUrl: "",
          apiKey: "",
          licenseKey: "",
          secretNotes: "",
          isClientVisible: true,
        });
        await fetchCredentials();
      } else {
        toastError("Save Failed", res.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisibility = async (credId: string, currentVal: boolean) => {
    try {
      const res = await toggleCredentialVisibilityAction(credId, !currentVal);
      if (res.success) {
        toast.success("Visibility Updated");
        await fetchCredentials();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    }
  };

  const handleDelete = async (credId: string) => {
    try {
      const res = await deleteServiceCredentialAction(credId);
      if (res.success) {
        toast.success("Credential Deleted");
        await fetchCredentials();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    }
  };

  const togglePasswordMask = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Credentials Vault — ${serviceName}`}
      description="Secure vault for usernames, passwords, API keys, and access links."
    >
      <div className="space-y-4 pt-2 pb-6">
        {isAdmin && !showAddForm && (
          <div className="flex justify-end">
            <Button variant="glow" size="sm" onClick={() => setShowAddForm(true)} className="text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add New Credentials
            </Button>
          </div>
        )}

        {/* Add Credential Form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="p-4 rounded-xl border border-primary/30 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">New Credential Entry</h4>
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddForm(false)} className="h-6 text-[10px]">
                Cancel
              </Button>
            </div>

            <FormField>
              <FormLabel htmlFor="credTitle">Credential Name *</FormLabel>
              <Input
                id="credTitle"
                value={form.credentialName}
                onChange={(e) => setForm((p) => ({ ...p, credentialName: e.target.value }))}
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField>
                <FormLabel htmlFor="uName">Username / Login ID</FormLabel>
                <Input
                  id="uName"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="pWord">Password</FormLabel>
                <Input
                  id="pWord"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                />
              </FormField>
            </div>

            <FormField>
              <FormLabel htmlFor="lUrl">Control Panel / Login URL</FormLabel>
              <Input
                id="lUrl"
                placeholder="https://cpanel.example.com"
                value={form.loginUrl}
                onChange={(e) => setForm((p) => ({ ...p, loginUrl: e.target.value }))}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField>
                <FormLabel htmlFor="aKey">API Key (Optional)</FormLabel>
                <Input
                  id="aKey"
                  value={form.apiKey}
                  onChange={(e) => setForm((p) => ({ ...p, apiKey: e.target.value }))}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="lKey">License Key (Optional)</FormLabel>
                <Input
                  id="lKey"
                  value={form.licenseKey}
                  onChange={(e) => setForm((p) => ({ ...p, licenseKey: e.target.value }))}
                />
              </FormField>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="clientVisible"
                  checked={form.isClientVisible}
                  onChange={(e) => setForm((p) => ({ ...p, isClientVisible: e.target.checked }))}
                  className="rounded border-border"
                />
                <label htmlFor="clientVisible" className="text-xs text-foreground cursor-pointer font-medium">
                  Share credential with Client in Client Portal
                </label>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="glow" size="sm" isLoading={isSubmitting}>
                Save Credential Entry
              </Button>
            </div>
          </form>
        )}

        {/* Credentials List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : credentials.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
            <Key className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No credentials stored for this asset.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {credentials.map((cred) => (
              <div key={cred.id} className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs text-foreground">{cred.credentialName}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(cred.id, cred.isClientVisible)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                          cred.isClientVisible ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {cred.isClientVisible ? "Shared with Client" : "Staff Only"}
                      </button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cred.id)} className="h-6 text-rose-500 px-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {cred.loginUrl && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span className="text-muted-foreground text-[11px]">URL:</span>
                      <div className="flex items-center gap-2">
                        <a href={cred.loginUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
                          {cred.loginUrl} <ExternalLink className="h-3 w-3" />
                        </a>
                        <button type="button" onClick={() => handleCopy(cred.loginUrl!, `url-${cred.id}`)} className="text-muted-foreground hover:text-foreground">
                          {copiedKey === `url-${cred.id}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {cred.username && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span className="text-muted-foreground text-[11px]">Username:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{cred.username}</span>
                        <button type="button" onClick={() => handleCopy(cred.username!, `u-${cred.id}`)} className="text-muted-foreground hover:text-foreground">
                          {copiedKey === `u-${cred.id}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {cred.password && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span className="text-muted-foreground text-[11px]">Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {visiblePasswords[cred.id] ? cred.password : "••••••••••••"}
                        </span>
                        <button type="button" onClick={() => togglePasswordMask(cred.id)} className="text-muted-foreground hover:text-foreground">
                          {visiblePasswords[cred.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button type="button" onClick={() => handleCopy(cred.password!, `p-${cred.id}`)} className="text-muted-foreground hover:text-foreground">
                          {copiedKey === `p-${cred.id}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {cred.apiKey && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span className="text-muted-foreground text-[11px]">API Key:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground truncate max-w-[180px]">{cred.apiKey}</span>
                        <button type="button" onClick={() => handleCopy(cred.apiKey!, `k-${cred.id}`)} className="text-muted-foreground hover:text-foreground">
                          {copiedKey === `k-${cred.id}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}
