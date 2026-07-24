"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuditLogsAction } from "@/features/settings/actions/settings-actions";
import { SystemAuditLogRecord } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Search, RefreshCw, Clock, User, ShieldCheck } from "lucide-react";

export default function AdminAuditLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<SystemAuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await getAuditLogsAction();
      if (res.success && res.data) {
        setLogs(res.data.auditLogs);
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to load system audit logs." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = search.trim() === ""
    ? logs
    : logs.filter((l) =>
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.actorName.toLowerCase().includes(search.toLowerCase()) ||
        l.category.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="System Audit Logs & Governance Trail"
        description="Immutable record of administrative actions, settings changes, and security events."
        badge={<StatusBadge status="active" customLabel="Audit Logging Active" />}
      />

      {/* Control Bar */}
      <div className="flex items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/80 glass-panel">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search audit logs by actor, action, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Button variant="outline" size="sm" onClick={fetchLogs} className="h-9 text-xs">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Audit Logs Table */}
      <Card variant="glass" className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No system audit logs found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Action Description</th>
                  <th className="p-3">Actor / Admin</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                      <span>{log.action}</span>
                    </td>
                    <td className="p-3 text-muted-foreground font-medium">{log.actorName}</td>
                    <td className="p-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-muted text-muted-foreground uppercase">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
