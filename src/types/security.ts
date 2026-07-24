export type SecurityEventCategory =
  | "auth"
  | "security"
  | "credentials"
  | "vault"
  | "settings"
  | "permissions"
  | "billing";

export type SecurityEventSeverity = "info" | "warning" | "critical";

export interface SecurityEventRecord {
  id: string;
  actorId?: string;
  actorName: string;
  targetEntity?: string;
  targetId?: string;
  action: string;
  category: SecurityEventCategory;
  severity: SecurityEventSeverity;
  ipAddress: string;
  userAgent?: string;
  status: "success" | "failed";
  metadata?: any;
  createdAt: string;
}

export interface UserSessionRecord {
  id: string;
  userId: string;
  userName: string;
  deviceInfo: string;
  browser: string;
  os: string;
  ipAddress: string;
  isCurrentSession: boolean;
  lastActivityAt: string;
  loginAt: string;
}

export interface CredentialAuditRecord {
  id: string;
  serviceId?: string;
  credentialId?: string;
  actorName: string;
  action: "viewed" | "copied" | "updated" | "shared";
  createdAt: string;
}

export interface SecurityOverviewStats {
  totalEventsToday: number;
  failedLoginsToday: number;
  activeSessionsCount: number;
  lockedAccountsCount: number;
  criticalAlertsCount: number;
}

export interface SecurityFilters {
  search?: string;
  category?: SecurityEventCategory | "all";
  severity?: SecurityEventSeverity | "all";
  status?: "success" | "failed" | "all";
}
