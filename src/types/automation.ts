export type TriggerEventType =
  | "client_created"
  | "client_onboarded"
  | "service_activated"
  | "service_expired"
  | "service_renewal_due"
  | "invoice_created"
  | "invoice_paid"
  | "invoice_overdue"
  | "payment_completed"
  | "payment_failed"
  | "ticket_created"
  | "ticket_replied";

export type WorkflowActionType =
  | "send_notification"
  | "send_email"
  | "generate_invoice"
  | "update_status"
  | "run_background_job"
  | "call_webhook";

export interface WorkflowAction {
  type: WorkflowActionType;
  config?: any;
}

export interface WorkflowRecord {
  id: string;
  name: string;
  description: string;
  triggerEvent: TriggerEventType;
  conditions?: any[];
  actions: WorkflowAction[];
  isEnabled: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  executionCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationJobRecord {
  id: string;
  workflowId?: string;
  workflowName?: string;
  triggerEvent: TriggerEventType;
  status: "queued" | "running" | "completed" | "failed";
  payload?: any;
  errorMessage?: string;
  retriesCount: number;
  runAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface AutomationHistoryRecord {
  id: string;
  jobId?: string;
  workflowName: string;
  triggerEvent: TriggerEventType;
  status: "completed" | "failed";
  durationMs: number;
  logs?: any[];
  createdAt: string;
}

export interface AutomationStatsPayload {
  totalWorkflows: number;
  activeWorkflows: number;
  queuedJobsCount: number;
  runningJobsCount: number;
  completedJobsCount: number;
  failedJobsCount: number;
  avgExecutionTimeMs: number;
}
