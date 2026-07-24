export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "client" | "team_member";
export type OrganizationRole = "owner" | "admin" | "member" | "billing_contact";
export type ServiceStatus = "active" | "pending" | "suspended" | "cancelled" | "expired";
export type BillingCycle = "monthly" | "quarterly" | "semi_annually" | "annually" | "biennially" | "one_time";
export type InvoiceStatus = "draft" | "unpaid" | "paid" | "overdue" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "cancelled";
export type PaymentMethod = "uddoktapay" | "card" | "bank_transfer" | "credits" | "manual";
export type TicketStatus = "open" | "in_progress" | "awaiting_client" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type NotificationChannel = "in_app" | "email" | "sms" | "push";
export type NotificationStatus = "unread" | "read" | "archived";
export type AuditAction = "create" | "update" | "delete" | "login" | "logout" | "permission_change" | "export";
export type AccountStatus = "active" | "suspended" | "unverified";

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  company_name: string | null;
  timezone: string | null;
  language: string | null;
  account_status: AccountStatus | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProfileInsert {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: UserRole;
  phone?: string | null;
  company_name?: string | null;
  timezone?: string | null;
  language?: string | null;
  account_status?: AccountStatus | null;
  metadata?: Json | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProfileUpdate {
  id?: string;
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: UserRole;
  phone?: string | null;
  company_name?: string | null;
  timezone?: string | null;
  language?: string | null;
  account_status?: AccountStatus | null;
  metadata?: Json | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  billing_email: string | null;
  tax_id: string | null;
  settings: Json | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OrganizationInsert {
  id?: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  website?: string | null;
  billing_email?: string | null;
  tax_id?: string | null;
  settings?: Json | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface OrganizationUpdate {
  id?: string;
  name?: string;
  slug?: string;
  logo_url?: string | null;
  website?: string | null;
  billing_email?: string | null;
  tax_id?: string | null;
  settings?: Json | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      organizations: {
        Row: OrganizationRow;
        Insert: OrganizationInsert;
        Update: OrganizationUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_client: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      organization_role: OrganizationRole;
      service_status: ServiceStatus;
      billing_cycle: BillingCycle;
      invoice_status: InvoiceStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
      audit_action: AuditAction;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
