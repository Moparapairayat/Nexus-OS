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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs mobile-card-table">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Asset Name & Type</th>
                  <th className="p-3">Client Organization</th>
                  <th className="p-3">Price & Cycle</th>
                  <th className="p-3">Next Renewal</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-semibold text-foreground flex items-center gap-2.5" data-label="Asset Name & Type">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 border border-border shrink-0">
                        <Server className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="block font-bold text-foreground">{srv.customName}</span>
                        <span className="text-[11px] text-muted-foreground">{srv.categoryName}</span>
                      </div>
                    </td>
                    <td className="p-3" data-label="Client Organization">
                      <span className="block font-bold text-foreground">{srv.companyName}</span>
                      <span className="text-[11px] text-muted-foreground">{srv.clientName}</span>
                    </td>
                    <td className="p-3" data-label="Price & Cycle">
                      <span className="font-bold text-foreground">${srv.customPrice.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground block uppercase">{srv.billingCycle}</span>
                    </td>
                    <td className="p-3 text-muted-foreground" data-label="Next Renewal">
                      {srv.renewalDate ? new Date(srv.renewalDate).toLocaleDateString() : "Lifetime / One-Time"}
                    </td>
                    <td className="p-3" data-label="Status">
                      <StatusBadge status={srv.serviceStatus === "active" ? "active" : "pending"} customLabel={srv.serviceStatus} />
                    </td>
                    <td className="p-3 text-right flex-wrap gap-1" data-label="Actions">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVaultService({ id: srv.id, name: srv.customName })}
                          className="h-7 text-xs px-2.5 gap-1 border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <Key className="h-3 w-3" /> Credentials
                        </Button>
                        <Button
                          variant="glow"
                          size="sm"
                          onClick={() => handleRenew(srv.id, srv.customName)}
                          className="h-7 text-xs px-2.5 gap-1"
                        >
                          <RefreshCw className="h-3 w-3" /> Renew
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <Input
                id="priceVal"
                type="number"
                value={assignForm.customPrice}
                onChange={(e) => setAssignForm((p) => ({ ...p, customPrice: Number(e.target.value) }))}
              />
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
            <Input
              id="renewalDt"
              type="date"
              value={assignForm.renewalDate}
              onChange={(e) => setAssignForm((p) => ({ ...p, renewalDate: e.target.value }))}
            />
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
