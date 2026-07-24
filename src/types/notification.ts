export type NotificationCategory =
  | "billing"
  | "invoices"
  | "payments"
  | "renewals"
  | "support"
  | "announcements"
  | "security"
  | "system"
  | "maintenance"
  | "account"
  | "custom";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type NotificationStatus = "unread" | "read" | "archived";

export interface ClientNotification {
  id: string;
  clientId: string;
  recipientId?: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
  createdAt: string;
  readAt?: string;
}

export interface EmailLogRecord {
  id: string;
  clientId?: string;
  recipientEmail: string;
  subject: string;
  templateName: string;
  status: "queued" | "sent" | "delivered" | "failed";
  errorMessage?: string;
  metadata?: any;
  sentAt: string;
  createdAt: string;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  category: "announcement" | "maintenance" | "downtime" | "feature" | "update";
  audience: "all" | "specific_clients";
  targetClientIds?: string[];
  status: "draft" | "published" | "scheduled" | "archived";
  publishedAt: string;
  createdBy?: string;
  createdAt: string;
}

export interface EmailTemplateRecord {
  id: string;
  templateKey: string;
  name: string;
  subjectTemplate: string;
  bodyTemplate: string;
  category: string;
  isActive: boolean;
  updatedAt: string;
}

export interface CommunicationStats {
  totalEmailsSent: number;
  failedEmails: number;
  unreadNotifications: number;
  activeAnnouncements: number;
}
