"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { RevenueTrendChart } from "@/features/analytics/components/revenue-trend-chart";
import { CategoryDistributionChart } from "@/features/analytics/components/category-distribution-chart";
import {
  getExecutiveAnalyticsAction,
  generateFinancialReportAction,
} from "@/features/analytics/actions/analytics-actions";
import {
  AnalyticsDataPayload,
  AnalyticsTimeRange,
} from "@/types/analytics";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  Package,
  RefreshCw,
  Download,
  Printer,
  Calendar,
  CheckCircle,
  HelpCircle,
  Building2,
  FileText,
} from "lucide-react";

export default function AdminAnalyticsWorkspacePage() {
  const { toast, error: toastError } = useToast();
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>("this_month");
  const [payload, setPayload] = useState<AnalyticsDataPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await getExecutiveAnalyticsAction(timeRange);
      if (res.success && res.data) {
        setPayload(res.data);
      } else {
        toastError("Analytics Error", res.error);
      }
    } catch (err) {
      toastError("Error", "Failed to load executive analytics dataset.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleExportCSV = async (reportType: string) => {
    setIsExporting(true);
    try {
      const res = await generateFinancialReportAction(reportType);
      if (res.success && res.csvContent) {
        const blob = new Blob([res.csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", res.filename || `NexusOS_${reportType}_Report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Report Exported!", { description: `Downloaded ${res.filename}` });
      }
    } catch (err: any) {
      toastError("Export Failed", err?.message);
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = payload?.kpis;

  const tabItems = payload
    ? [
        {
          id: "revenue",
          label: "Revenue & Financial Growth",
          content: (
            <div className="pt-3 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Monthly Revenue Trend vs Collections</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Compares billed invoice volume with settled payment collections.</p>
                </div>
                <StatusBadge status="active" customLabel="Live Aggregation" />
              </div>

              <RevenueTrendChart data={payload.revenueTrends} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <Card variant="glass" className="p-4 border-primary/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Monthly Billed Revenue</span>
                  <span className="text-xl font-bold font-mono text-primary mt-1 block">
                    ${kpis?.monthlyRevenue.toFixed(2)}
                  </span>
                </Card>
                <Card variant="glass" className="p-4 border-emerald-500/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Today's Collections</span>
                  <span className="text-xl font-bold font-mono text-emerald-500 mt-1 block">
                    ${kpis?.todayCollections.toFixed(2)}
                  </span>
                </Card>
                <Card variant="glass" className="p-4 border-rose-500/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Outstanding Balance</span>
                  <span className="text-xl font-bold font-mono text-rose-500 mt-1 block">
                    ${kpis?.outstandingBalance.toFixed(2)}
                  </span>
                </Card>
              </div>
            </div>
          ),
        },
        {
          id: "clients",
          label: "Client LTV Insights",
          content: (
            <div className="pt-3 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Top Client Revenue Ranking (Lifetime LTV)</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs mobile-card-table">
                  <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Client Organization</th>
                      <th className="p-3">Primary Email</th>
                      <th className="p-3">Active Assets</th>
                      <th className="p-3">Lifetime Revenue</th>
                      <th className="p-3">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {payload.topClients.map((cli, idx) => (
                      <tr key={cli.clientId} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-mono font-bold text-muted-foreground" data-label="Rank">#{idx + 1}</td>
                        <td className="p-3 font-bold text-foreground" data-label="Client Organization">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{cli.companyName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground" data-label="Primary Email">{cli.primaryEmail}</td>
                        <td className="p-3 font-semibold" data-label="Active Assets">{cli.activeServicesCount} Provisioned</td>
                        <td className="p-3 font-mono font-bold text-emerald-500" data-label="Lifetime Revenue">${cli.totalRevenue.toFixed(2)}</td>
                        <td className="p-3" data-label="Account Status">
                          <StatusBadge status={cli.status as any} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ),
        },
        {
          id: "services",
          label: "Digital Assets Distribution",
          content: (
            <div className="pt-3 space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Active Services Revenue Breakdown</h4>
              <CategoryDistributionChart data={payload.categoryDistributions} />
            </div>
          ),
        },
        {
          id: "reports",
          label: "Financial Reports & Export Engine",
          content: (
            <div className="pt-3 space-y-4 max-w-xl">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Download Printable & CSV Reports</h4>
              
              <div className="space-y-3">
                <Card variant="glass" className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">Revenue & Payment Audit Trail</span>
                      <span className="text-[11px] text-muted-foreground">Full CSV breakdown of all payment transactions.</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" isLoading={isExporting} onClick={() => handleExportCSV("revenue")} className="text-xs gap-1">
                    <Download className="h-3.5 w-3.5" /> CSV Report
                  </Button>
                </Card>

                <Card variant="glass" className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-500" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">Invoice Summary & Balance Due</span>
                      <span className="text-[11px] text-muted-foreground">Export all issued, paid, and overdue invoice records.</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" isLoading={isExporting} onClick={() => handleExportCSV("invoices")} className="text-xs gap-1">
                    <Download className="h-3.5 w-3.5" /> CSV Report
                  </Button>
                </Card>
              </div>
            </div>
          ),
        },
      ]
    : [];

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Business Intelligence & Analytics Center"
        description="Executive metrics, Monthly Recurring Revenue (MRR), client LTV insights, and financial reports."
      />

      {/* Time Range Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/80 glass-panel">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Time Range Horizon:</span>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as AnalyticsTimeRange)}
            options={[
              { value: "today", label: "Today" },
              { value: "last_7_days", label: "Last 7 Days" },
              { value: "last_30_days", label: "Last 30 Days" },
              { value: "this_month", label: "This Month" },
              { value: "last_month", label: "Last Month" },
              { value: "this_year", label: "This Year" },
              { value: "all_time", label: "All Time" },
            ]}
          />
          <Button variant="outline" size="sm" onClick={fetchAnalytics} className="h-9 text-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <ResponsiveGrid cols={4}>
            <StatCard
              title="Monthly Recurring Revenue (MRR)"
              value={`$${kpis?.monthlyRecurringRevenue.toFixed(2)}`}
              subtitle="Active subscription value"
              icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
            />
            <StatCard
              title="Annualized Run Rate (ARR)"
              value={`$${kpis?.annualRevenue.toFixed(2)}`}
              subtitle="Projected annual revenue"
              icon={<DollarSign className="h-4 w-4 text-blue-500" />}
            />
            <StatCard
              title="Payment Success Rate"
              value={`${kpis?.paymentSuccessRate}%`}
              subtitle="Gateway completion SLA"
              icon={<CheckCircle className="h-4 w-4 text-purple-500" />}
            />
            <StatCard
              title="Active Digital Assets"
              value={String(kpis?.activeServicesCount)}
              subtitle={`${kpis?.renewalsDueCount} due for renewal`}
              icon={<Package className="h-4 w-4 text-amber-500" />}
            />
          </ResponsiveGrid>

          {/* Main Analytics Tabs */}
          <Card variant="glass" className="p-5">
            <Tabs items={tabItems} defaultTabId="revenue" />
          </Card>
        </>
      )}
    </PageContainer>
  );
}
