export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

export type PaymentMethod =
  | "uddoktapay"
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
  gatewayInvoiceId?: string;
  paymentUrl?: string;
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

// UddoktaPay API Interfaces
export interface UddoktaPayCheckoutPayload {
  full_name: string;
  email: string;
  amount: number;
  metadata: {
    invoice_id: string;
    client_id: string;
    payment_number: string;
    [key: string]: any;
  };
  redirect_url: string;
  cancel_url: string;
  webhook_url: string;
}

export interface UddoktaPayCheckoutResponse {
  status: boolean;
  message?: string;
  payment_url?: string;
  invoice_id?: string;
}

export interface UddoktaPayVerifyResponse {
  status: "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED" | string;
  transaction_id?: string;
  invoice_id?: string;
  amount?: string | number;
  fee?: string | number;
  payment_method?: string;
  sender_number?: string;
  date?: string;
  metadata?: any;
}
