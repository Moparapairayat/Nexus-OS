export type HealthStatus = "operational" | "degraded" | "outage";

export interface SystemHealthCheck {
  id: string;
  serviceName: string;
  status: HealthStatus;
  latencyMs: number;
  lastCheckedAt: string;
  message: string;
}

export interface SystemErrorRecord {
  id: string;
  module: string;
  errorMessage: string;
  stackTrace?: string;
  severity: "info" | "warning" | "critical";
  status: "unresolved" | "resolved";
  createdAt: string;
}

export interface MaintenanceConfig {
  id?: string;
  isEnabled: boolean;
  message: string;
  allowedIps?: string[];
  enabledAt?: string;
  updatedAt?: string;
}

export interface OperationsOverviewPayload {
  systemUptimePercent: number;
  healthChecks: SystemHealthCheck[];
  unresolvedErrorsCount: number;
  maintenanceMode: MaintenanceConfig;
  nodeEnv: string;
  supabaseRegion: string;
  databaseVersion: string;
  nextVersion: string;
}

export interface SystemErrorFilters {
  module?: string;
  severity?: "info" | "warning" | "critical" | "all";
  status?: "unresolved" | "resolved" | "all";
  search?: string;
}
