export type InvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled"
  | "void"
  | "refund_ready";

export type BillingType =
  | "one_time"
  | "recurring"
  | "renewal"
  | "manual"
  | "custom"
  | "usage";

export type TaxRuleType = "none" | "vat" | "gst" | "custom_fixed" | "custom_percent";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  serviceId?: string;
  serviceName?: string;
}

export interface InvoiceFile {
  id: string;
  invoiceId: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface InvoiceActivity {
  id: string;
  invoiceId: string;
  type:
    | "created"
    | "edited"
    | "sent"
    | "viewed"
    | "downloaded"
    | "reminder_sent"
    | "marked_paid"
    | "cancelled"
    | "voided";
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-000001
  clientId: string;
  clientName: string;
  companyName: string;
  clientEmail: string;
  billingAddress?: string;
  country: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  invoiceStatus: InvoiceStatus;
  billingType: BillingType;
  notes?: string;
  clientNotes?: string;
  terms?: string;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  subtotal: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;

  // Nested collections
  items: InvoiceItem[];
  attachments?: InvoiceFile[];
  activities?: InvoiceActivity[];
}

export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus | "all";
  clientId?: string;
  billingType?: BillingType | "all";
  currency?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "invoiceNumber" | "issueDate" | "dueDate" | "grandTotal" | "invoiceStatus";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
