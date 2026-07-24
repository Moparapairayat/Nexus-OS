export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

export type PaymentMethod =
  | "bkash"
  | "nagad"
  | "rocket"
  | "upay"
  | "card"
  | "bank_transfer"
  | "credits"
  | "manual";

export interface PaymentRecord {
  id: string;
  clientId: string;
  clientName?: string;
  companyName?: string;
  clientEmail?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
  notes?: string;
  rawPayload?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  gatewayName: string;
  transactionId: string;
  senderNumber?: string;
  gatewayFee: number;
  method: string;
  status: string;
  rawPayload?: any;
  verifiedAt?: string;
  createdAt: string;
}

export interface PaymentLog {
  id: string;
  paymentId?: string;
  invoiceId?: string;
  clientId?: string;
  eventType:
    | "payment_started"
    | "redirected"
    | "webhook_received"
    | "webhook_verified"
    | "invoice_paid"
    | "receipt_generated"
    | "notification_sent"
    | "payment_failed"
    | "resynced"
    | "manual_verified";
  description: string;
  performedBy: string;
  metadata?: any;
  createdAt: string;
}

export interface PaymentReceipt {
  id: string;
  paymentId: string;
  invoiceId?: string;
  receiptNumber: string;
  invoiceNumber: string;
  clientName: string;
  companyName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  pdfUrl?: string;
  issuedAt: string;
}

export interface PaymentFilters {
  search?: string;
  status?: PaymentStatus | "all";
  clientId?: string;
  invoiceId?: string;
  method?: PaymentMethod | "all";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
