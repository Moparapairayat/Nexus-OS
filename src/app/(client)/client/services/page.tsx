"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CredentialsVaultDrawer } from "@/features/services/components/credentials-vault-drawer";
import { getClientServicesAction } from "@/features/services/actions/service-actions";
import { ClientService } from "@/types/service";
import { Package, Globe, Server, Cloud, Calendar, ShieldCheck, Key } from "lucide-react";

export default function ClientServicesPortalPage() {
  const [services, setServices] = useState<ClientService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vaultService, setVaultService] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    async function loadClientAssets() {
      setIsLoading(true);
      try {
        const result = await getClientServicesAction();
        if (result.success && result.data) {
          setServices(result.data.services);
        }
      } catch (err) {
        console.error("Failed to load client assets:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadClientAssets();
  }, []);

  const activeAssets = services.filter((s) => s.serviceStatus === "active");

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="My Active Digital Services & Assets"
        description="Overview of your managed domains, cloudflare security, VPS hosting, and shared access credentials."
      />

      <ResponsiveGrid cols={3}>
        <StatCard
          title="Active Assets"
          value={activeAssets.length.toString()}
          subtitle="Provisioned & Operational"
          icon={<Package className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Security SLA"
          value="100% Protected"
          subtitle="Cloudflare WAF Active"
          icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Upcoming Renewals"
          value="1"
          subtitle="Scheduled this month"
          icon={<Calendar className="h-4 w-4 text-amber-500" />}
        />
      </ResponsiveGrid>

      <div className="space-y-4">
        <h3 className="text-base font-bold tracking-tight">Assigned Digital Assets ({services.length})</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => (
              <Card key={srv.id} variant="glass" className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      {srv.categoryName.includes("Cloudflare") ? (
                        <Cloud className="h-5 w-5 text-amber-500" />
                      ) : srv.categoryName.includes("Server") ? (
                        <Server className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Globe className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{srv.customName}</h4>
                      <span className="text-xs text-muted-foreground">{srv.categoryName}</span>
                    </div>
                  </div>
                  <StatusBadge status={srv.serviceStatus as any} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/40">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Primary Domain</span>
                    <span className="font-semibold text-foreground font-mono">{srv.domainName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Next Renewal</span>
                    <span className="font-semibold text-foreground">
                      {srv.renewalDate ? new Date(srv.renewalDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="flex flex-wrap gap-1">
                    {srv.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVaultService({ id: srv.id, name: srv.customName })}
                    className="h-7 text-xs px-2.5 gap-1 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Key className="h-3.5 w-3.5" /> View Credentials
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Shared Credentials Drawer */}
      {vaultService && (
        <CredentialsVaultDrawer
          serviceId={vaultService.id}
          serviceName={vaultService.name}
          isOpen={Boolean(vaultService)}
          onClose={() => setVaultService(null)}
          isAdmin={false}
        />
      )}
    </PageContainer>
  );
}
