"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField, FormLabel } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { Tabs } from "@/components/ui/tabs";
import {
  getVaultFilesAction,
  createVaultFileAction,
  trackFileDownloadAction,
  deleteVaultFileAction,
  getVaultStorageStatsAction,
} from "@/features/documents/actions/vault-actions";
import { getClientsAction } from "@/features/clients/actions/client-actions";
import { VaultFileRecord, VaultCategory, VaultStorageStats } from "@/types/document";
import { useToast } from "@/hooks/use-toast";
import {
  FolderOpen,
  FileText,
  Receipt,
  FileCheck2,
  Shield,
  Server,
  Download,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Printer,
  HardDrive,
  Building2,
  Lock,
} from "lucide-react";

export default function AdminDigitalVaultPage() {
  const { toast, error: toastError } = useToast();
  const [files, setFiles] = useState<VaultFileRecord[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [stats, setStats] = useState<VaultStorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<VaultCategory | "all">("all");
  const [search, setSearch] = useState("");

  // Upload Drawer State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: "contracts" as VaultCategory,
    clientId: "",
    fileType: "PDF Document",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fRes, cRes, stRes] = await Promise.all([
        getVaultFilesAction({ category: filterCategory, search }),
        getClientsAction(),
        getVaultStorageStatsAction(),
      ]);

      if (fRes.success && fRes.data) setFiles(fRes.data.files);
      if (cRes.success && cRes.data) setClients(cRes.data.clients);
      if (stRes.success && stRes.data) setStats(stRes.data.stats);
    } catch (err) {
      toastError("Error", "Failed to load digital vault files.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const res = await createVaultFileAction(uploadForm);
      if (res.success) {
        toast.success("Document Index Vaulted!", { description: `File ${uploadForm.name} added.` });
        setShowUploadModal(false);
        setUploadForm({ name: "", category: "contracts", clientId: "", fileType: "PDF Document" });
        await fetchData();
      } else {
        toastError("Upload Failed", res.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (file: VaultFileRecord) => {
    await trackFileDownloadAction(file.id);
    if (file.invoiceId) {
      window.open(`/client/invoices/${file.invoiceId}`, "_blank");
    } else {
      toast.success("Downloading File", { description: `Preparing download for ${file.name}...` });
    }
    await fetchData();
  };

  const handleDelete = async (fileId: string) => {
    try {
      const res = await deleteVaultFileAction(fileId);
      if (res.success) {
        toast.success("File Removed from Vault");
        await fetchData();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "receipts":
        return <Receipt className="h-4 w-4 text-emerald-500" />;
      case "contracts":
        return <FileCheck2 className="h-4 w-4 text-purple-500" />;
      case "identity":
      case "ssl":
        return <Shield className="h-4 w-4 text-amber-500" />;
      case "hosting":
        return <Server className="h-4 w-4 text-indigo-500" />;
      default:
        return <FileText className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredFiles = search.trim() === ""
    ? files
    : files.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        (f.companyName && f.companyName.toLowerCase().includes(search.toLowerCase())) ||
        f.category.toLowerCase().includes(search.toLowerCase())
      );

  const totalDownloadCount = files.reduce((acc, f) => acc + f.downloadCount, 0);

  const tabItems = [
    {
      id: "directory",
      label: "Vaulted Documents & File Directory",
      content: (
        <div className="pt-3 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search vault by file name, client organization, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 justify-end shrink-0">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                options={[
                  { value: "all", label: "All Categories" },
                  { value: "invoices", label: "Invoices" },
                  { value: "receipts", label: "Receipts" },
                  { value: "contracts", label: "Contracts" },
                  { value: "identity", label: "Identity" },
                  { value: "hosting", label: "Hosting" },
                  { value: "ssl", label: "SSL & Security" },
                  { value: "domains", label: "Domains" },
                  { value: "general", label: "General" },
                ]}
              />
              <Button variant="outline" size="sm" onClick={fetchData} className="h-9 text-xs">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
              <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No vault documents found matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">File Name</th>
                    <th className="p-3">Client Organization</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Downloads</th>
                    <th className="p-3">Date Vaulted</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 border border-border shrink-0">
                          {getCategoryIcon(file.category)}
                        </div>
                        <span className="truncate max-w-[220px]">{file.name}</span>
                      </td>
                      <td className="p-3 font-bold text-foreground">
                        <span className="block">{file.companyName}</span>
                        <span className="text-[11px] text-muted-foreground">{file.clientName}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-muted text-muted-foreground capitalize">
                          {file.category}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">{file.fileSize}</td>
                      <td className="p-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {file.downloadCount} Downloads
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{new Date(file.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleDownload(file)} className="h-7 text-xs px-2.5 gap-1">
                            <Download className="h-3 w-3" /> Download
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(file.id)} className="h-7 text-xs px-2 text-rose-500 hover:text-rose-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "analytics",
      label: "Storage Health & Usage Breakdown",
      content: (
        <div className="pt-3 space-y-4 max-w-2xl">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Supabase Storage Usage by Category</h4>
          
          <div className="space-y-3">
            {(stats?.categoryBreakdown || []).map((cat) => (
              <div key={cat.category} className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="capitalize text-foreground">{cat.category} Vault</span>
                  <span className="text-muted-foreground">{cat.count} Files</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(cat.count * 15, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Digital Vault & Document Management Center"
        description="Centralized indexing for contracts, invoices, UddoktaPay receipts, SSL certificates, and client files."
      />

      {/* KPI Stats */}
      <ResponsiveGrid cols={4}>
        <StatCard
          title="Total Vaulted Storage"
          value={stats?.totalStorageFormatted || "5.2 MB"}
          subtitle="Supabase Storage Cloud"
          icon={<HardDrive className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Total Vault Files"
          value={String(stats?.totalFilesCount || files.length)}
          subtitle="Indexed document records"
          icon={<FolderOpen className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Total File Downloads"
          value={String(totalDownloadCount)}
          subtitle="Client & staff downloads"
          icon={<Download className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          title="Vault Security"
          value="RLS Secured"
          subtitle="Client isolated storage"
          icon={<Lock className="h-4 w-4 text-amber-500" />}
        />
      </ResponsiveGrid>

      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/80 glass-panel">
        <h3 className="font-bold text-sm text-foreground">Digital Vault Manager ({files.length})</h3>
        <Button variant="glow" size="sm" onClick={() => setShowUploadModal(true)} className="text-xs">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Index / Upload Document
        </Button>
      </div>

      {/* Main Tabs */}
      <Card variant="glass" className="p-5">
        <Tabs items={tabItems} defaultTabId="directory" />
      </Card>

      {/* Upload / Index Document Sheet */}
      <Sheet
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Index / Upload Document to Vault"
        description="Add contracts, agreements, SSL certificates, or hosting files."
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2 pb-6">
          <FormField>
            <FormLabel htmlFor="fileName">Document Name *</FormLabel>
            <Input
              id="fileName"
              placeholder="e.g. Master Service Agreement 2026.pdf"
              value={uploadForm.name}
              onChange={(e) => setUploadForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField>
              <FormLabel htmlFor="docCategory">Category *</FormLabel>
              <Select
                id="docCategory"
                value={uploadForm.category}
                onChange={(e) => setUploadForm((p) => ({ ...p, category: e.target.value as VaultCategory }))}
                options={[
                  { value: "contracts", label: "Contracts & Agreements" },
                  { value: "identity", label: "Identity & Verification" },
                  { value: "hosting", label: "Hosting & Server Keys" },
                  { value: "ssl", label: "SSL Certificates" },
                  { value: "domains", label: "Domain Records" },
                  { value: "invoices", label: "Invoices" },
                  { value: "receipts", label: "Receipts" },
                  { value: "general", label: "General Document" },
                ]}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="docClient">Client Account</FormLabel>
              <Select
                id="docClient"
                value={uploadForm.clientId}
                onChange={(e) => setUploadForm((p) => ({ ...p, clientId: e.target.value }))}
                options={[
                  { value: "", label: "General System Document" },
                  ...clients.map((c) => ({ value: c.id, label: `${c.companyName} (${c.fullName})` })),
                ]}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" size="sm" isLoading={isUploading}>
              Index Document
            </Button>
          </div>
        </form>
      </Sheet>
    </PageContainer>
  );
}
