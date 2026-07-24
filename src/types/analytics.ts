export type AnalyticsTimeRange =
  | "today"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "last_month"
  | "this_year"
  | "all_time";

export interface ExecutiveKpiMetrics {
  monthlyRevenue: number;
  annualRevenue: number;
  monthlyRecurringRevenue: number; // MRR
  activeClientsCount: number;
  newClientsThisMonth: number;
  activeServicesCount: number;
  pendingInvoicesCount: number;
  overdueInvoicesCount: number;
  renewalsDueCount: number;
  todayCollections: number;
  outstandingBalance: number;
  paymentSuccessRate: number;
  openTicketsCount: number;
}

export interface RevenueTrendPoint {
  period: string;
  revenue: number;
  collections: number;
  outstanding: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface TopClientMetrics {
  clientId: string;
  companyName: string;
  primaryEmail: string;
  activeServicesCount: number;
  totalRevenue: number;
  status: string;
}

export interface SupportDepartmentMetrics {
  department: string;
  openCount: number;
  resolvedCount: number;
  avgResponseMinutes: number;
}

export interface AnalyticsDataPayload {
  kpis: ExecutiveKpiMetrics;
  revenueTrends: RevenueTrendPoint[];
  categoryDistributions: CategoryDistribution[];
  topClients: TopClientMetrics[];
  supportMetrics: SupportDepartmentMetrics[];
}
