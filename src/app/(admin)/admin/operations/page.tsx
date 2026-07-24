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
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormLabel } from "@/components/ui/form";
import { Tabs } from "@/components/ui/tabs";
import {
  getOperationsOverviewAction,
  getSystemErrorLogsAction,
  resolveErrorAction,
  toggleMaintenanceModeAction,
} from "@/features/operations/actions/operations-actions";
import {
  OperationsOverviewPayload,
  SystemErrorRecord,
} from "@/types/operations";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  HardDrive,
  Mail,
  RefreshCw,
  Search,
  Shield,
  Clock,
  Cpu,
  Wrench,
  Info,
} from "lucide-react";

export default function AdminOperationsCenterPage() {
  const { toast, error: toastError } = useToast();
  const [data, setData] = useState<OperationsOverviewPayload | null>(null);
  const [errors, setErrors] = useState<SystemErrorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMaint, setIsSavingMaint] = useState(false);
  const [maintMessage, setMaintMessage] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [opRes, errRes] = await Promise.all([
        getOperationsOverviewAction(),
        getSystemErrorLogsAction(),
      ]);

      if (opRes.success && opRes.data) {
        setData(opRes.data);
        setMaintMessage(opRes.data.maintenanceMode.message);
      }
      if (errRes.success && errRes.data) setErrors(errRes.data.errorLogs);
    } catch (err) {
      toastError("Error", "Failed to load operations center diagnostics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleMaintenance = async (currentVal: boolean) => {
    setIsSavingMaint(true);
    try {
      const res = await toggleMaintenanceModeAction(!currentVal, maintMessage);
      if (res.success) {
        toast.success("Maintenance Mode Updated", {
          description: `Platform Maintenance is now ${!currentVal ? "ENABLED" : "DISABLED"}.`,
        });
        await fetchData();
      } else {
        toastError("Update Failed", res.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    } finally {
      setIsSavingMaint(false);
    }
  };

  const handleResolveError = async (id: string) => {
    try {
      const res = await resolveErrorAction(id);
      if (res.success) {
        toast.success("Error Resolved");
        await fetchData();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    }
  };

  const tabItems = data
    ? [
        {
          id: "health",
          label: "System Health & Diagnostics",
          content: (
            <div className="pt-3 space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={fetchData} className="h-8 text-xs gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Run Diagnostics
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.healthChecks.map((hc) => (
                  <Card key={hc.id} variant="glass" className="p-4 space-y-2 border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs capitalize text-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" /> {hc.serviceName} Engine
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                        {hc.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">{hc.message}</p>

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span>Latency: <strong className="text-foreground">{hc.latencyMs} ms</strong></span>
                      <span>Checked: {new Date(hc.lastCheckedAt).toLocaleTimeString()}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ),
        },
        {
          id: "errors",
          label: "Error Center & Stack Traces",
          content: (
            <div className="pt-3 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs mobile-card-table">
                  <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Module</th>
                      <th className="p-3">Error Message</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Logged At</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {errors.map((err) => (
                      <tr key={err.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-mono font-bold text-primary capitalize" data-label="Module">{err.module}</td>
                        <td className="p-3 font-medium text-foreground max-w-xs truncate" data-label="Error Message">{err.errorMessage}</td>
                        <td className="p-3" data-label="Severity">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-muted text-muted-foreground uppercase">
                            {err.severity}
                          </span>
                        </td>
                        <td className="p-3" data-label="Status">
                          <StatusBadge status={err.status === "resolved" ? "active" : "pending"} customLabel={err.status} />
                        </td>
                        <td className="p-3 font-mono text-muted-foreground" data-label="Logged At">{new Date(err.createdAt).toLocaleString()}</td>
                        <td className="p-3 text-right" data-label="Action">
                          {err.status === "unresolved" && (
                            <Button variant="outline" size="sm" onClick={() => handleResolveError(err.id)} className="h-7 text-xs px-2.5">
                              Resolve
                            </Button>
                          )}
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
          id: "maintenance",
          label: "Maintenance Mode Control",
          content: (
            <div className="pt-3 max-w-2xl space-y-4">
              <Card variant="glass" className="p-5 border-amber-500/30 bg-amber-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-amber-500" />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Platform Maintenance Status</h4>
                      <span className="text-xs text-muted-foreground">
                        {data.maintenanceMode.isEnabled ? "Platform is currently in Maintenance Mode" : "Platform is operational normally"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant={data.maintenanceMode.isEnabled ? "outline" : "glow"}
                    size="sm"
                    isLoading={isSavingMaint}
                    onClick={() => handleToggleMaintenance(data.maintenanceMode.isEnabled)}
                    className="text-xs"
                  >
                    {data.maintenanceMode.isEnabled ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
                  </Button>
                </div>

                <FormField>
                  <FormLabel htmlFor="maintMsg">Client Maintenance Notice Message</FormLabel>
                  <Textarea
                    id="maintMsg"
                    value={maintMessage}
                    onChange={(e) => setMaintMessage(e.target.value)}
                    rows={3}
                  />
                </FormField>
              </Card>
            </div>
          ),
        },
        {
          id: "info",
          label: "System Information & Environment",
          content: (
            <div className="pt-3 max-w-2xl space-y-3 font-mono text-xs">
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Application Framework:</span>
                  <span className="font-bold text-foreground">{data.nextVersion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Database Engine:</span>
                  <span className="font-bold text-foreground">{data.databaseVersion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Supabase Region:</span>
                  <span className="font-bold text-foreground">{data.supabaseRegion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Node Environment:</span>
                  <span className="font-bold text-emerald-500 uppercase">{data.nodeEnv}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">System SLA Uptime:</span>
                  <span className="font-bold text-foreground">{data.systemUptimePercent}%</span>
                </div>
              </div>
            </div>
          ),
        },
      ]
    : [];

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Operations Center & System Monitoring"
        description="Centralized platform diagnostics, database health, error tracking, and maintenance mode."
      />

      {/* KPI Stats */}
      <ResponsiveGrid cols={4}>
        <StatCard
          title="Platform Uptime"
          value={`${data?.systemUptimePercent || 99.98}%`}
          subtitle="30-day SLA rolling window"
          icon={<Activity className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Database Status"
          value="OPERATIONAL"
          subtitle="PostgreSQL 15.6 Singapore"
          icon={<Server className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Unresolved Errors"
          value={String(data?.unresolvedErrorsCount || errors.length)}
          subtitle="Tracked system logs"
          icon={<AlertTriangle className="h-4 w-4 text-purple-500" />}
        />
      </ResponsiveGrid>

      {/* Main Tabs */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Card variant="glass" className="p-5">
          <Tabs items={tabItems} defaultTabId="health" />
        </Card>
      )}
    </PageContainer>
  );
}
