import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/session";
import { getClientServicesAction } from "@/features/services/actions/service-actions";
import { getInvoicesAction } from "@/features/billing/actions/billing-actions";
import { getSupportTicketsAction } from "@/features/support/actions/support-actions";
import {
  Package,
  CreditCard,
  MessageSquare,
  Bell,
  ArrowRight,
  FileText,
  Clock,
  ShieldCheck,
  Globe,
  Server,
  Cloud,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const user = await getCurrentUser();

  let activeServicesCount = 0;
  let totalServicesCount = 0;
  let outstandingBalance = 0;
  let openTicketsCount = 0;
  let recentServices: any[] = [];

  try {
    const [srvRes, invRes, tktRes] = await Promise.all([
      getClientServicesAction(),
      getInvoicesAction(),
      getSupportTicketsAction(),
    ]);

    if (srvRes.success && srvRes.data) {
      const allServices = srvRes.data.services;
      totalServicesCount = allServices.length;
      recentServices = allServices.slice(0, 3);
      activeServicesCount = allServices.filter(
        (s) => s.serviceStatus === "active"
      ).length;
    }

    if (invRes.success && invRes.data) {
      outstandingBalance = invRes.data.invoices.reduce(
        (acc, inv) => acc + inv.balanceDue,
        0
      );
    }

    if (tktRes.success && tktRes.data) {
      openTicketsCount = tktRes.data.tickets.filter(
        (t) => t.status !== "closed"
      ).length;
    }
  } catch (err) {
    console.error("Failed to load client dashboard stats:", err);
  }

  const quickActions = [
    { label: "View Invoices", href: "/client/invoices", icon: FileText, color: "text-blue-500" },
    { label: "My Services", href: "/client/services", icon: Package, color: "text-emerald-500" },
    { label: "Service Renewals", href: "/client/renewals", icon: Clock, color: "text-amber-500" },
    { label: "Raise Ticket", href: "/client/support", icon: MessageSquare, color: "text-purple-500" },
    { label: "View Documents", href: "/client/documents", icon: FileText, color: "text-indigo-500" },
  ];

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(" ")[0] || "Client"} 👋`}
        description={`${user?.companyName || "Your"} client portal — manage services, invoices, and support all in one place.`}
        badge={<StatusBadge status="active" customLabel="Account Active" />}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Services"
          value={String(activeServicesCount)}
          subtitle={totalServicesCount === 0 ? "No services assigned" : `${totalServicesCount} total provisioned`}
          icon={<Package className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${outstandingBalance.toFixed(2)}`}
          subtitle={outstandingBalance === 0 ? "All accounts settled" : "Payment due"}
          icon={<CreditCard className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Open Tickets"
          value={String(openTicketsCount)}
          subtitle={openTicketsCount === 0 ? "No active tickets" : "Support ticket active"}
          icon={<MessageSquare className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          title="Notifications"
          value="0"
          subtitle="All clear"
          icon={<Bell className="h-4 w-4 text-amber-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card variant="glass" className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Jump to frequently used sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <action.icon className={`h-4 w-4 shrink-0 ${action.color}`} />
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Assigned Services Overview */}
        <Card variant="glass" className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">My Digital Services</CardTitle>
              <CardDescription className="text-xs">Assigned assets & operational status</CardDescription>
            </div>
            <Link href="/client/services">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                View All ({totalServicesCount}) <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border/60 rounded-xl bg-muted/10">
                <Clock className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-xs font-semibold text-foreground">No active services provisioned</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Services assigned by the admin team will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentServices.map((srv) => (
                  <div key={srv.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                        {srv.categoryName.includes("Cloudflare") ? (
                          <Cloud className="h-4 w-4 text-amber-500" />
                        ) : srv.categoryName.includes("Server") ? (
                          <Server className="h-4 w-4 text-purple-500" />
                        ) : (
                          <Globe className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">{srv.customName}</span>
                        <span className="text-[11px] text-muted-foreground">{srv.categoryName} &bull; {srv.domainName || "Active"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={srv.serviceStatus as any} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Security Card */}
      <Card variant="glass">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Portal Status & Security</CardTitle>
            <CardDescription className="text-xs">Verified portal connection</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-foreground">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">Authenticated & Secure Session</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">Your portal account is active. Admin invitations generate real Supabase Auth credentials upon acceptance.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
