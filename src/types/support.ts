export type TicketStatus =
  | "open"
  | "waiting_staff"
  | "waiting_client"
  | "in_progress"
  | "resolved"
  | "closed"
  | "reopened"
  | "cancelled";

export type TicketPriority =
  | "low"
  | "normal"
  | "medium"
  | "high"
  | "urgent"
  | "critical";

export type TicketDepartment =
  | "support"
  | "billing"
  | "sales"
  | "technical"
  | "hosting"
  | "cloudflare"
  | "domains"
  | "development"
  | "security"
  | "general";

// Backward compatibility alias
export type TicketCategory = TicketDepartment;

export interface TicketAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

export interface TicketReply {
  id: string;
  ticketId: string;
  senderId?: string;
  authorName: string;
  authorRole: "client" | "admin" | "team_member";
  content: string;
  isInternal: boolean;
  attachments?: TicketAttachment[];
  createdAt: string;
}

export interface TicketLog {
  id: string;
  ticketId: string;
  clientId?: string;
  eventType:
    | "ticket_created"
    | "status_changed"
    | "priority_changed"
    | "department_changed"
    | "assigned_changed"
    | "reply_added"
    | "internal_note_added"
    | "ticket_resolved"
    | "ticket_closed"
    | "ticket_reopened";
  description: string;
  performedBy: string;
  metadata?: any;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  clientId: string;
  companyName?: string;
  clientName?: string;
  clientEmail: string;
  serviceId?: string;
  serviceName?: string;
  subject: string;
  description: string;
  category: TicketCategory;
  department: TicketDepartment;
  priority: TicketPriority;
  status: TicketStatus;
  assignedToId?: string;
  assignedTo?: string;
  createdBy?: string;
  replies: TicketReply[];
  logs?: TicketLog[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface TicketFilters {
  search?: string;
  department?: TicketDepartment | "all";
  priority?: TicketPriority | "all";
  status?: TicketStatus | "all";
  clientId?: string;
  serviceId?: string;
  assignedToId?: string;
  page?: number;
  limit?: number;
}
