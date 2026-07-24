"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getClientServicesAction } from "@/features/services/actions/service-actions";
import { ClientService } from "@/types/service";
import { RefreshCw, Calendar, AlertTriangle, ShieldCheck, ArrowRight, DollarSign, Clock } from "lucide-react";

export default function ClientRenewalsPage() {
  const [services, setServices] = useState<ClientService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRenewals() {
      setIsLoading(true);
      try {
        const res = await getClientServicesAction();
        if (res.success && res.data) {
          setServices(res.data.services);
        }
      } catch (err) {
        console.error("Failed to load renewal services:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRenewals();
  }, []);

  const now = new Date();
  const upcomingRenewals = services.filter((s) => {
    if (!s.renewalDate) return false;
    const diffDays = Math.ceil(
      (new Date(s.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
    );
    return diffDays >= 0 && diffDays <= 30;
  });

  const overdueRenewals = services.filter((s) => {
    if (!s.renewalDate) return false;
    return new Date(s.renewalDate).getTime() < now.getTime() && s.serviceStatus !== "cancelled";
  });

  const autoRenewalCount = services.filter((s) => s.autoRenewal).length;

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Renewal Engine & Subscription Center"
        description="Monitor service expiration timelines, auto-renewals, and execute single-click renewal billing."
      />

      <ResponsiveGrid cols={3}>
        <StatCard
          title="Upcoming Renewals"
          value={String(upcomingRenewals.length)}
          subtitle="Next 30 days"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
        />
        <StatCard
          title="Overdue Renewals"
          value={String(overdueRenewals.length)}
          subtitle="Action required"
          icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
        />
        <StatCard
          title="Auto-Renewal Protected"
          value={String(autoRenewalCount)}
          subtitle="Seamless continuation"
          icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
        />
      </ResponsiveGrid>

      {/* Main Renewals List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold tracking-tight">Active Digital Assets & Expirations</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
            No active digital assets scheduled for renewal.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {services.map((srv) => {
              const isOverdue = srv.renewalDate && new Date(srv.renewalDate).getTime() < now.getTime();
              return (
                <Card key={srv.id} variant="glass" className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{srv.customName}</h4>
                        <StatusBadge status={srv.serviceStatus as any} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {srv.categoryName} &bull; ${srv.customPrice.toFixed(2)} / {srv.billingCycle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Next Expiration</span>
                      <span className={`text-xs font-bold font-mono ${isOverdue ? "text-rose-500" : "text-foreground"}`}>
                        {srv.renewalDate ? new Date(srv.renewalDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>

                    <Link href="/client/invoices">
                      <Button variant="glow" size="sm" className="text-xs gap-1">
                        <DollarSign className="h-3.5 w-3.5" /> Pay Renewal <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
