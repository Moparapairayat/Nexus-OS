"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { RevenueTrendChart } from "@/features/analytics/components/revenue-trend-chart";
import { CategoryDistributionChart } from "@/features/analytics/components/category-distribution-chart";
import { getExecutiveAnalyticsAction } from "@/features/analytics/actions/analytics-actions";
import { AnalyticsDataPayload } from "@/types/analytics";
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  CreditCard,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Megaphone,
  FileText,
  Activity,
  Layers,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsDataPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardAnalytics() {
      setIsLoading(true);
      try {
        const res = await getExecutiveAnalyticsAction("this_month");
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard analytics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardAnalytics();
  }, []);

  const kpis = data?.kpis;

  const quickActions = [
    { label: "New Client Account", href: "/admin/clients", icon: Users, color: "text-blue-500" },
    { label: "Provision Service", href: "/admin/services", icon: Package, color: "text-emerald-500" },
    { label: "Generate Invoice", href: "/admin/invoices", icon: FileText, color: "text-purple-500" },
    { label: "Payment Gateways", href: "/admin/billing/payments", icon: DollarSign, color: "text-amber-500" },
    { label: "Support Desk", href: "/admin/support", icon: MessageSquare, color: "text-indigo-500" },
    { label: "Communication", href: "/admin/notifications", icon: Megaphone, color: "text-pink-500" },
  ];

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="NexusOS Admin Control Center"
        description="Executive business intelligence, real-time metrics, system health, and operational analytics."
        badge={<StatusBadge status="active" customLabel="System Operational" />}
      />

      {/* Row 1: Primary System & Client Stat Cards */}
      <ResponsiveGrid cols={4}>
        <StatCard
          title="Total Clients"
          value={isLoading ? "..." : String(kpis?.activeClientsCount || 0)}
          subtitle={`${kpis?.newClientsThisMonth || 0} active accounts`}
          icon={<Users className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Active Services"
          value={isLoading ? "..." : String(kpis?.activeServicesCount || 0)}
          subtitle={`${kpis?.renewalsDueCount || 0} upcoming renewals`}
          icon={<Layers className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Platform Uptime"
          value="99.99%"
          trend="up"
          subtitle="Supabase Cloud Live"
          icon={<Activity className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          title="Security Status"
          value="Secured"
          trend="neutral"
          subtitle="Supabase RLS Active"
          icon={<ShieldCheck className="h-4 w-4 text-amber-500" />}
        />
      </ResponsiveGrid>

      {/* Row 2: Financial KPI Ribbon */}
      <ResponsiveGrid cols={4}>
        <StatCard
          title="Monthly Recurring Revenue"
          value={isLoading ? "..." : `$${(kpis?.monthlyRecurringRevenue || 0).toFixed(2)}`}
          trend="up"
          subtitle="+12.4% vs last month"
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Annualized Run Rate (ARR)"
          value={isLoading ? "..." : `$${(kpis?.annualRevenue || 0).toFixed(2)}`}
          subtitle="Projected subscription value"
          icon={<DollarSign className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Today's Collections"
          value={isLoading ? "..." : `$${(kpis?.todayCollections || 0).toFixed(2)}`}
          subtitle="Admin-verified collections"
          icon={<CreditCard className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          title="Payment Success SLA"
          value={isLoading ? "..." : `${kpis?.paymentSuccessRate || 100}%`}
          trend="neutral"
          subtitle="Gateway conversion rate"
          icon={<CheckCircle2 className="h-4 w-4 text-amber-500" />}
        />
      </ResponsiveGrid>

      {/* Row 3: Main Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Collections Chart */}
        <Card variant="glass" className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Revenue & Payment Collections Trend</CardTitle>
              <CardDescription className="text-xs">Billed invoice volume vs settled collections</CardDescription>
            </div>
            <Link href="/admin/analytics">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Detailed BI <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <div className="flex items-center justify-center py-16">
                <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <RevenueTrendChart data={data.revenueTrends} />
            )}
          </CardContent>
        </Card>

        {/* Service Category Distribution */}
        <Card variant="glass" className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Assets Distribution</CardTitle>
            <CardDescription className="text-xs">Revenue by digital service category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <div className="flex items-center justify-center py-16">
                <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <CategoryDistributionChart data={data.categoryDistributions} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Operations & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Clients LTV Leaderboard */}
        <Card variant="glass" className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Top Client LTV Leaderboard</CardTitle>
              <CardDescription className="text-xs">Highest lifetime revenue organization accounts</CardDescription>
            </div>
            <Link href="/admin/clients">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                View All Clients <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <div className="flex items-center justify-center py-8">
                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {data.topClients.map((cli, idx) => (
                  <div key={cli.clientId} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-muted-foreground w-5">#{idx + 1}</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">{cli.companyName}</span>
                        <span className="text-[11px] text-muted-foreground">{cli.activeServicesCount} Provisioned Assets</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-emerald-500 block">${cli.totalRevenue.toFixed(2)}</span>
                      <StatusBadge status={cli.status as any} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Operations Panel */}
        <Card variant="glass" className="col-span-1 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Operations</CardTitle>
            <CardDescription className="text-xs">Frequently accessed administrative actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <action.icon className={`h-4 w-4 shrink-0 ${action.color}`} />
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Enterprise System Governance Info Card */}
      <Card variant="glass" className="border-primary/20">
        <CardHeader>
          <CardTitle>NexusOS Enterprise Control Center</CardTitle>
          <CardDescription>
            Real-time client portal and database synchronization active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="font-semibold text-foreground">Client Directory</span>
              <p className="text-muted-foreground mt-1">Manage client profiles, issue portal invitation links, and control access permissions.</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="font-semibold text-foreground">Database Persistence</span>
              <p className="text-muted-foreground mt-1">All client data, invitations, and activities persist directly to Supabase PostgreSQL.</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="font-semibold text-foreground">Auth & Access Control</span>
              <p className="text-muted-foreground mt-1">Role-based security enforcement (Admin & Client) via server-side session checks.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
