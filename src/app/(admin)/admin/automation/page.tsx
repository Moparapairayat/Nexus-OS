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
import { Select } from "@/components/ui/select";
import { FormField, FormLabel } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { Tabs } from "@/components/ui/tabs";
import {
  getWorkflowsAction,
  createWorkflowAction,
  toggleWorkflowAction,
  deleteWorkflowAction,
  getAutomationJobsAction,
  triggerSystemEventAction,
  getAutomationStatsAction,
} from "@/features/automation/actions/automation-actions";
import {
  WorkflowRecord,
  AutomationJobRecord,
  AutomationStatsPayload,
  TriggerEventType,
  WorkflowActionType,
} from "@/types/automation";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Trash2,
  Clock,
  Activity,
  Layers,
  Cpu,
} from "lucide-react";

export default function AdminAutomationPage() {
  const { toast, error: toastError } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [jobs, setJobs] = useState<AutomationJobRecord[]>([]);
  const [stats, setStats] = useState<AutomationStatsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Workflow Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [wfForm, setWfForm] = useState({
    name: "",
    description: "",
    triggerEvent: "invoice_paid" as TriggerEventType,
    actionType: "send_email" as WorkflowActionType,
  });

  // Manual Event Trigger State
  const [isDispatching, setIsDispatching] = useState(false);
  const [testEvent, setTestEvent] = useState<TriggerEventType>("payment_completed");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [wfRes, jobRes, stRes] = await Promise.all([
        getWorkflowsAction(),
        getAutomationJobsAction(),
        getAutomationStatsAction(),
      ]);

      if (wfRes.success && wfRes.data) setWorkflows(wfRes.data.workflows);
      if (jobRes.success && jobRes.data) setJobs(jobRes.data.jobs);
      if (stRes.success && stRes.data) setStats(stRes.data.stats);
    } catch (err) {
      toastError("Error", "Failed to load automation engine data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await createWorkflowAction(wfForm);
      if (res.success) {
        toast.success("Workflow Rule Built!", { description: `Automation rule ${wfForm.name} created.` });
        setShowCreateModal(false);
        setWfForm({ name: "", description: "", triggerEvent: "invoice_paid", actionType: "send_email" });
        await fetchData();
      } else {
        toastError("Build Failed", res.error);
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleWorkflow = async (id: string, currentVal: boolean) => {
    try {
      const res = await toggleWorkflowAction(id, !currentVal);
      if (res.success) {
        toast.success("Workflow Toggled");
        await fetchData();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      const res = await deleteWorkflowAction(id);
      if (res.success) {
        toast.success("Workflow Rule Removed");
        await fetchData();
      }
    } catch (err: any) {
      toastError("Error", err?.message);
    }
  };

  const handleTestEventTrigger = async () => {
    setIsDispatching(true);
    try {
      const res = await triggerSystemEventAction(testEvent, { timestamp: new Date().toISOString(), trigger: "manual_admin_test" });
      if (res.success) {
        toast.success("System Event Dispatched!", {
          description: `Dispatched [${testEvent}]. Matched ${res.matchedCount} active workflow rules.`,
        });
        await fetchData();
      }
    } catch (err: any) {
      toastError("Trigger Failed", err?.message);
    } finally {
      setIsDispatching(false);
    }
  };

  const tabItems = [
    {
      id: "builder",
      label: "Active Workflows & Rule Builder",
      content: (
        <div className="pt-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((wf) => (
              <Card key={wf.id} variant="glass" className="p-5 flex flex-col justify-between space-y-4 hover:border-primary/30 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <h4 className="font-bold text-sm text-foreground">{wf.name}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleWorkflow(wf.id, wf.isEnabled)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                        wf.isEnabled ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {wf.isEnabled ? "ACTIVE" : "PAUSED"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{wf.description}</p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Trigger Event:</span>
                    <span className="font-mono font-semibold text-primary text-[11px]">{wf.triggerEvent}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono">{wf.executionCount} Runs</span>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteWorkflow(wf.id)} className="h-7 text-rose-500 hover:text-rose-600 px-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "queue",
      label: "Live Background Job Queue",
      content: (
        <div className="pt-3 space-y-4">
          {/* Manual Trigger Tester Bar */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-xs text-foreground block">Manual System Event Dispatcher</span>
              <span className="text-[11px] text-muted-foreground">Test matching active workflow rules in real-time.</span>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Select
                value={testEvent}
                onChange={(e) => setTestEvent(e.target.value as TriggerEventType)}
                options={[
                  { value: "payment_completed", label: "payment_completed" },
                  { value: "service_renewal_due", label: "service_renewal_due" },
                  { value: "ticket_created", label: "ticket_created" },
                  { value: "client_onboarded", label: "client_onboarded" },
                  { value: "invoice_paid", label: "invoice_paid" },
                ]}
              />
              <Button variant="glow" size="sm" isLoading={isDispatching} onClick={handleTestEventTrigger} className="text-xs gap-1">
                <Play className="h-3.5 w-3.5" /> Dispatch Event
              </Button>
            </div>
          </div>

          {/* Job Queue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Job ID</th>
                  <th className="p-3">Matched Workflow</th>
                  <th className="p-3">Trigger Event</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Executed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{j.id.slice(0, 8)}...</td>
                    <td className="p-3 font-semibold text-foreground">{j.workflowName}</td>
                    <td className="p-3 font-mono text-muted-foreground">{j.triggerEvent}</td>
                    <td className="p-3">
                      <StatusBadge status={j.status === "completed" ? "success" : "pending"} customLabel={j.status} />
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">{new Date(j.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Automation Engine & Workflow Builder"
        description="Event-driven workflows, background job queue, system event dispatcher, and SLA triggers."
      />

      {/* KPI Stats */}
      <ResponsiveGrid cols={4}>
        <StatCard
          title="Active Workflows"
          value={String(stats?.activeWorkflows || workflows.length)}
          subtitle="Running rule definitions"
          icon={<Zap className="h-4 w-4 text-amber-500" />}
        />
        <StatCard
          title="Completed Executions"
          value={String(stats?.completedJobsCount || jobs.length)}
          subtitle="Job queue executions"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Average Execution"
          value={`${stats?.avgExecutionTimeMs || 42} ms`}
          subtitle="Real-time latency"
          icon={<Clock className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Engine Status"
          value="Active"
          subtitle="Event dispatcher online"
          icon={<Cpu className="h-4 w-4 text-purple-500" />}
        />
      </ResponsiveGrid>

      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/80 glass-panel">
        <h3 className="font-bold text-sm text-foreground">Workflow Rules ({workflows.length})</h3>
        <Button variant="glow" size="sm" onClick={() => setShowCreateModal(true)} className="text-xs">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Build New Workflow Rule
        </Button>
      </div>

      {/* Main Tabs */}
      <Card variant="glass" className="p-5">
        <Tabs items={tabItems} defaultTabId="builder" />
      </Card>

      {/* Build Workflow Sheet */}
      <Sheet
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Build Automated Workflow Rule"
        description="Configure event triggers, matching rules, and automated actions."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2 pb-6">
          <FormField>
            <FormLabel htmlFor="wfName">Workflow Rule Name *</FormLabel>
            <Input
              id="wfName"
              placeholder="e.g. Notify Client on Payment Completed"
              value={wfForm.name}
              onChange={(e) => setWfForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="wfDesc">Description</FormLabel>
            <Textarea
              id="wfDesc"
              placeholder="Describe what this automation rule accomplishes..."
              value={wfForm.description}
              onChange={(e) => setWfForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField>
              <FormLabel htmlFor="triggerEvt">Trigger Event *</FormLabel>
              <Select
                id="triggerEvt"
                value={wfForm.triggerEvent}
                onChange={(e) => setWfForm((p) => ({ ...p, triggerEvent: e.target.value as TriggerEventType }))}
                options={[
                  { value: "payment_completed", label: "payment_completed" },
                  { value: "service_renewal_due", label: "service_renewal_due" },
                  { value: "ticket_created", label: "ticket_created" },
                  { value: "client_onboarded", label: "client_onboarded" },
                  { value: "invoice_paid", label: "invoice_paid" },
                  { value: "service_activated", label: "service_activated" },
                ]}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="actionType">Automated Action *</FormLabel>
              <Select
                id="actionType"
                value={wfForm.actionType}
                onChange={(e) => setWfForm((p) => ({ ...p, actionType: e.target.value as WorkflowActionType }))}
                options={[
                  { value: "send_notification", label: "Send In-App Notification" },
                  { value: "send_email", label: "Send Email Alert" },
                  { value: "generate_invoice", label: "Generate Invoice" },
                  { value: "update_status", label: "Update Status" },
                  { value: "run_background_job", label: "Run Background Job" },
                ]}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" size="sm" isLoading={isCreating}>
              Create Workflow Rule
            </Button>
          </div>
        </form>
      </Sheet>
    </PageContainer>
  );
}
