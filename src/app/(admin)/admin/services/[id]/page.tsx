"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getServiceByIdAction, updateServiceStatusAction, renewServiceAction, deleteServiceAction, getServiceCategoriesAction } from "@/features/services/actions/service-actions";
import { useRouter } from "next/navigation";
import { ClientService, ServiceStatus, ServiceCategory } from "@/types/service";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ServiceRenewalsManager } from "@/features/services/components/service-renewals-manager";
import { ServiceApiArchitecture } from "@/features/services/components/service-api-architecture";
import { ExtendRenewalModal } from "@/features/services/components/extend-renewal-modal";
import { EditServiceSheet } from "@/features/services/components/edit-service-sheet";
import { DeleteServiceDialog } from "@/features/services/components/delete-service-dialog";
import { Timeline } from "@/components/ui/timeline";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Globe,
  Server,
  Cloud,
  Calendar,
  DollarSign,
  RefreshCw,
  FileText,
  Building2,
  CheckCircle2,
  ShieldAlert,
  Pencil,
  Trash2,
} from "lucide-react";

export default function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const serviceId = resolvedParams.id;
  const { toast } = useToast();
  const router = useRouter();

  const [service, setService] = useState<ClientService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClientService | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  const fetchServiceData = async () => {
    setIsLoading(true);
    try {
      const [svcRes, catRes] = await Promise.all([
        getServiceByIdAction(serviceId),
        getServiceCategoriesAction(),
      ]);
      if (svcRes.success && svcRes.data) {
        setService(svcRes.data);
      } else {
        toast.error("Not Found", { description: "Digital asset record not found." });
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to load asset details." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [serviceId]);

  const handleStatusChange = async (newStatus: ServiceStatus) => {
    if (!service) return;
    try {
      const result = await updateServiceStatusAction(service.id, newStatus);
      if (result.success) {
        toast.success("Status Updated", { description: `Asset status changed to ${newStatus}.` });
        fetchServiceData();
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to update status." });
    }
  };

  const handleRenew = async () => {
    if (!service) return;
    try {
      const result = await renewServiceAction(service.id);
      if (result.success) {
        toast.success("Asset Renewed", { description: "Expiration date extended." });
        fetchServiceData();
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to renew asset." });
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageContainer>
    );
  }

  if (!service) {
    return (
      <PageContainer maxWidth="xl">
        <div className="p-8 text-center glass-panel rounded-2xl space-y-4">
          <h2 className="text-lg font-bold">Digital Asset Not Found</h2>
          <p className="text-xs text-muted-foreground">The requested asset record does not exist or has been removed.</p>
          <Link
            href="/admin/services"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors"
          >
            Back to Inventory
          </Link>
        </div>
      </PageContainer>
    );
  }

  const timelineEvents = (service.activities || []).map((act) => ({
    id: act.id,
    title: act.title,
    description: act.description,
    timestamp: new Date(act.timestamp).toLocaleString(),
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-primary" />,
  }));

  const tabItems = [
    {
      id: "overview",
      label: "Overview & Metadata",
      content: (
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card variant="glass" className="lg:col-span-2 p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-2">
                Technical Specifications & Endpoints
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Primary Domain</span>
                  <span className="font-semibold text-foreground font-mono">{service.domainName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Server IP Endpoint</span>
                  <span className="font-semibold text-foreground font-mono">{service.serverIp || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Cloudflare Zone ID</span>
                  <span className="font-mono text-foreground">{service.cloudflareZoneId || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Billing Cycle</span>
                  <span className="font-semibold text-foreground uppercase">{service.billingCycle}</span>
                </div>
              </div>

              {service.internalNotes && (
                <div className="pt-3 border-t border-border/40 text-xs">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold mb-1">Internal Setup Notes</span>
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{service.internalNotes}</p>
                </div>
              )}
            </Card>

            <Card variant="glass" className="p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-2">
                Assigned Client Summary
              </h3>

              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Company Name</span>
                  <Link href={`/admin/clients/${service.clientId}`} className="font-bold text-foreground hover:text-primary transition-colors">
                    {service.companyName}
                  </Link>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Primary Contact</span>
                  <span className="font-medium text-foreground">{service.clientName}</span>
                </div>
                <div className="pt-2 border-t border-border/40 flex justify-between items-center">
                  <span className="text-muted-foreground">Asset Price:</span>
                  <span className="font-bold text-foreground font-mono">${service.customPrice.toFixed(2)} {service.currency}</span>
                </div>
              </div>
            </Card>
          </div>

          <ServiceApiArchitecture
            categoryName={service.categoryName}
            domainName={service.domainName}
            serverIp={service.serverIp}
            cloudflareZoneId={service.cloudflareZoneId}
          />
        </div>
      ),
    },
    {
      id: "renewals",
      label: "Billing & Renewals",
      content: (
        <div className="pt-4">
          <ServiceRenewalsManager
            serviceId={service.id}
            renewalDate={service.renewalDate}
            billingCycle={service.billingCycle}
            cost={service.customPrice}
            currency={service.currency}
            autoRenewal={service.autoRenewal}
            renewals={service.renewals || []}
            onRenewSuccess={fetchServiceData}
          />
        </div>
      ),
    },
    {
      id: "timeline",
      label: "Activity Log",
      content: (
        <div className="pt-4 space-y-4">
          <h3 className="text-base font-bold tracking-tight">Timestamped Lifecycle Timeline</h3>
          <Timeline events={timelineEvents} />
        </div>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="xl">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/admin/services"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Digital Assets Directory
        </Link>
      </div>

      {/* Header Profile Summary */}
      <Card variant="glass" className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              {service.categoryName.includes("Cloudflare") ? (
                <Cloud className="h-6 w-6 text-amber-500" />
              ) : service.categoryName.includes("Server") ? (
                <Server className="h-6 w-6 text-purple-500" />
              ) : (
                <Globe className="h-6 w-6 text-blue-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{service.customName}</h1>
                <StatusBadge status={service.serviceStatus as any} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>Assigned to: <strong className="text-foreground">{service.companyName}</strong></span>
                <span>&bull;</span>
                <span className="font-mono">{service.categoryName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="glow"
              size="sm"
              onClick={() => setExtendModalOpen(true)}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5 font-semibold"
            >
              <Calendar className="h-3.5 w-3.5" /> Extend Renewal Date
            </Button>
            <Button variant="outline" size="sm" onClick={handleRenew} className="text-xs">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> Renew Asset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="text-xs border-blue-500/30 text-blue-500 hover:bg-blue-500/10 gap-1"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant={service.serviceStatus === "active" ? "secondary" : "glow"}
              size="sm"
              onClick={() => handleStatusChange(service.serviceStatus === "active" ? "suspended" : "active")}
              className="text-xs"
            >
              {service.serviceStatus === "active" ? "Suspend Asset" : "Activate Asset"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteTarget(service)}
              className="text-xs"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-border/40">
          {service.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0.5">
              {tag}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs items={tabItems} defaultTabId="overview" />

      {/* Extend Renewal Modal */}
      {extendModalOpen && (
        <ExtendRenewalModal
          isOpen={extendModalOpen}
          onClose={() => setExtendModalOpen(false)}
          serviceId={service.id}
          serviceName={service.customName}
          currentRenewalDate={service.renewalDate}
          onSuccess={fetchServiceData}
        />
      )}

      {/* Edit Service Sheet */}
      {editModalOpen && service && (
        <EditServiceSheet
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          service={service}
          categories={categories}
          onSuccess={fetchServiceData}
        />
      )}

      {/* Delete Service Dialog */}
      {deleteTarget && (
        <DeleteServiceDialog
          service={deleteTarget}
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={(id) => {
            toast.success("Service Removed", { description: "Digital asset has been deleted." });
            router.push("/admin/services");
          }}
          onDelete={deleteServiceAction}
        />
      )}
    </PageContainer>
  );
}
