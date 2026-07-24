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
import { CredentialsVaultDrawer } from "@/features/services/components/credentials-vault-drawer";
import { ServiceTable } from "@/features/services/components/service-table";
import {
  getClientServicesAction,
  getServiceCategoriesAction,
  assignClientServiceAction,
  renewServiceAction,
  updateServiceStatusAction,
} from "@/features/services/actions/service-actions";
import { getClientsAction } from "@/features/clients/actions/client-actions";
import { ClientService, ServiceCategory, ServiceStatus, BillingCycle } from "@/types/service";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  Key,
  Calendar,
  Server,
  Globe,
  Cloud,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function AdminServicesPage() {
  const { toast, error: toastError } = useToast();
  const [services, setServices] = useState<ClientService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Credentials Vault Drawer State
  const [vaultService, setVaultService] = useState<{ id: string; name: string } | null>(null);

  // Assign Asset Drawer State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignForm, setAssignForm] = useState({
    clientId: "",
    categoryId: "",
    customName: "",
    customPrice: 29.99,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    serviceStatus: "active" as ServiceStatus,
    autoRenewal: true,
    domainName: "",
    serverIp: "",
    _rdMonth: new Date().getMonth(),
    _rdDay: new Date(Date.now() + 30 * 86400000).getDate(),
    _rdYear: new Date(Date.now() + 30 * 86400000).getFullYear(),
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sRes, cRes, clRes] = await Promise.all([
        getClientServicesAction({ categoryId: filterCategory !== "all" ? filterCategory : undefined, search }),
        getServiceCategoriesAction(),
        getClientsAction(),
      ]);

      if (sRes.success && sRes.data) setServices(sRes.data.services);
      if (cRes.success && cRes.data) setCategories(cRes.data);
      if (clRes.success && clRes.data) setClients(clRes.data.clients);
    } catch (err) {
      toastError("Error", "Failed to load digital assets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigning(true);
    try {
      const res = await assignClientServiceAction(assignForm);
      if (res.success) {
        toast.success("Digital Asset Assigned!", { description: `Assigned ${assignForm.customName}` });
        setShowAssignModal(false);
        setAssignForm({
          clientId: "",
          categoryId: "",
          customName: "",
          customPrice: 29.99,
          currency: "USD",
          billingCycle: "monthly",
          renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          serviceStatus: "active",
          autoRenewal: true,
          domainName: "",
          serverIp: "",
          _rdMonth: new Date().getMonth(),
          _rdDay: new Date(Date.now() + 30 * 86400000).getDate(),
          _rdYear: new Date(Date.now() + 30 * 86400000).getFullYear(),
        });
        await fetchData();
      } else {
        toastError("Assignment Failed", res.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRenew = async (serviceId: string, name: string) => {
    try {
      const res = await renewServiceAction(serviceId);
      if (res.success) {
        toast.success("Asset Renewed!", { description: `Renewed ${name} for next billing cycle.` });
        await fetchData();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    }
  };

  const activeCount = services.filter((s) => s.serviceStatus === "active").length;

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Digital Asset & Service Management Center"
        description="Organize and manage Web Hosting, Domains, Cloudflare WAF, SSL, and licenses manually assigned to clients."
      />

      {/* KPI Stats */}
      <ResponsiveGrid cols={4}>
        <StatCard
          title="Active Digital Assets"
          value={String(activeCount)}
          subtitle="Provisioned services"
          icon={<Server className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Total Managed Assets"
          value={String(services.length)}
          subtitle="All client digital services"
          icon={<Package className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Renewals Due Soon"
          value="3 Assets"
          subtitle="Next 30-day window"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
        />
        <StatCard
          title="Monthly Asset MRR"
          value="$1,450.00"
          subtitle="Recurring subscription revenue"
          icon={<CreditCard className="h-4 w-4 text-purple-500" />}
        />
      </ResponsiveGrid>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/80 glass-panel">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search assets by name, domain, client organization, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0">
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={[
              { value: "all", label: "All Categories" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <Button variant="outline" size="sm" onClick={fetchData} className="h-9 text-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
          <Button variant="glow" size="sm" onClick={() => setShowAssignModal(true)} className="h-9 text-xs">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Assign Digital Asset
          </Button>
        </div>
      </div>

      {/* Assets Directory Table */}
      <Card variant="glass" className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No digital assets found matching query.</p>
          </div>
        ) : (
          <ServiceTable
            data={services}
            isLoading={isLoading}
            onStatusChange={async (id, status) => {
              await updateServiceStatusAction(id, status);
              await fetchData();
            }}
            onRenew={async (id) => {
              await renewServiceAction(id);
              await fetchData();
            }}
            onRefresh={fetchData}
            onServiceDeleted={(id) => {
              setServices((prev) => prev.filter((s) => s.id !== id));
            }}
            onServiceUpdated={(id, updated) => {
              setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
            }}
          />
        )}
      </Card>

      {/* Credentials Vault Drawer Component */}
      {vaultService && (
        <CredentialsVaultDrawer
          serviceId={vaultService.id}
          serviceName={vaultService.name}
          isOpen={Boolean(vaultService)}
          onClose={() => setVaultService(null)}
          isAdmin={true}
        />
      )}

      {/* Assign Digital Asset Sheet */}
      <Sheet
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Digital Asset to Client"
        description="Manually create and bind a hosting plan, domain, SSL, or software license."
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 pt-2 pb-6">
          <FormField>
            <FormLabel htmlFor="assetName">Asset / Service Name *</FormLabel>
            <Input
              id="assetName"
              placeholder="e.g. Enterprise Cloud VPS - node-bd-01"
              value={assignForm.customName}
              onChange={(e) => setAssignForm((p) => ({ ...p, customName: e.target.value }))}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField>
              <FormLabel htmlFor="targetClient">Client Account *</FormLabel>
              <Select
                id="targetClient"
                value={assignForm.clientId}
                onChange={(e) => setAssignForm((p) => ({ ...p, clientId: e.target.value }))}
                options={[
                  { value: "", label: "Select Client Account..." },
                  ...clients.map((c) => ({ value: c.id, label: `${c.companyName} (${c.fullName})` })),
                ]}
                required
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="assetCat">Category *</FormLabel>
              <Select
                id="assetCat"
                value={assignForm.categoryId}
                onChange={(e) => setAssignForm((p) => ({ ...p, categoryId: e.target.value }))}
                options={[
                  { value: "", label: "Select Category..." },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField>
              <FormLabel htmlFor="priceVal">Price ($ / ৳)</FormLabel>
              <Select
                id="priceVal"
                value={String(assignForm.customPrice)}
                onChange={(e) =>
                  e.target.value === "custom"
                    ? setAssignForm((p) => ({ ...p, customPrice: 0 }))
                    : setAssignForm((p) => ({ ...p, customPrice: Number(e.target.value) }))
                }
                options={[
                  { value: "9.99", label: "$9.99" },
                  { value: "19.99", label: "$19.99" },
                  { value: "29.99", label: "$29.99" },
                  { value: "49.0", label: "$49.00" },
                  { value: "79.0", label: "$79.00" },
                  { value: "99.0", label: "$99.00" },
                  { value: "149.0", label: "$149.00" },
                  { value: "199.0", label: "$199.00" },
                  { value: "299.0", label: "$299.00" },
                  { value: "499.0", label: "$499.00" },
                  { value: "custom", label: "Custom Price..." },
                ]}
              />
              {(assignForm.customPrice as number) === 0 && (
                <Input
                  type="number"
                  step="0.01"
                  value={assignForm.customPrice}
                  onChange={(e) => setAssignForm((p) => ({ ...p, customPrice: Number(e.target.value) }))}
                  className="mt-2 text-xs"
                  placeholder="Enter custom amount"
                />
              )}
            </FormField>

            <FormField>
              <FormLabel htmlFor="cycleVal">Billing Cycle</FormLabel>
              <Select
                id="cycleVal"
                value={assignForm.billingCycle}
                onChange={(e) => setAssignForm((p) => ({ ...p, billingCycle: e.target.value as BillingCycle }))}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "annual", label: "Annual" },
                  { value: "quarterly", label: "Quarterly" },
                  { value: "one_time", label: "One-Time" },
                ]}
              />
            </FormField>
          </div>

          <FormField>
            <FormLabel htmlFor="renewalDt">Initial Renewal Date</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              <Select
                id="renewalDtMonth"
                value={String(assignForm._rdMonth ?? new Date().getMonth())}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10);
                  const y = parseInt(String(assignForm._rdYear ?? new Date().getFullYear()), 10);
                  const maxDay = new Date(y, m + 1, 0).getDate();
                  const d = Math.min(assignForm._rdDay ?? 1, maxDay);
                  setAssignForm((p) => ({
                    ...p,
                    _rdMonth: m,
                    _rdDay: d,
                    renewalDate: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
                  }));
                }}
                options={[
                  { value: "0", label: "Jan" },
                  { value: "1", label: "Feb" },
                  { value: "2", label: "Mar" },
                  { value: "3", label: "Apr" },
                  { value: "4", label: "May" },
                  { value: "5", label: "Jun" },
                  { value: "6", label: "Jul" },
                  { value: "7", label: "Aug" },
                  { value: "8", label: "Sep" },
                  { value: "9", label: "Oct" },
                  { value: "10", label: "Nov" },
                  { value: "11", label: "Dec" },
                ]}
              />
              <Select
                id="renewalDtDay"
                value={String(assignForm._rdDay ?? 1)}
                onChange={(e) => {
                  const d = parseInt(e.target.value, 10);
                  const m = parseInt(String(assignForm._rdMonth ?? new Date().getMonth()), 10);
                  const y = parseInt(String(assignForm._rdYear ?? new Date().getFullYear()), 10);
                  const maxDay = new Date(y, m + 1, 0).getDate();
                  const clamped = Math.min(d, maxDay);
                  setAssignForm((p) => ({
                    ...p,
                    _rdDay: clamped,
                    renewalDate: `${y}-${String(m + 1).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`,
                  }));
                }}
                options={Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
              />
              <Select
                id="renewalDtYear"
                value={String(assignForm._rdYear ?? new Date().getFullYear())}
                onChange={(e) => {
                  const y = parseInt(e.target.value, 10);
                  const m = parseInt(String(assignForm._rdMonth ?? new Date().getMonth()), 10);
                  const maxDay = new Date(y, m + 1, 0).getDate();
                  const d = Math.min(assignForm._rdDay ?? 1, maxDay);
                  setAssignForm((p) => ({
                    ...p,
                    _rdYear: y,
                    _rdDay: d,
                    renewalDate: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
                  }));
                }}
                options={Array.from({ length: 11 }, (_, i) => {
                  const cy = new Date().getFullYear();
                  return { value: String(cy + i), label: String(cy + i) };
                })}
              />
            </div>
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" size="sm" isLoading={isAssigning}>
              Assign Digital Asset
            </Button>
          </div>
        </form>
      </Sheet>
    </PageContainer>
  );
}
