export interface SystemHealthCheck {
  id: string;
  name: string;
  category: "database" | "auth" | "storage" | "environment" | "email" | "payments" | "runtime";
  status: "passed" | "warning" | "failed";
  message: string;
  details?: string;
}

export interface CompanyInfo {
  name: string;
  logoUrl?: string;
  email: string;
  phone?: string;
  website?: string;
  address: string;
  country: string;
  timezone: string;
  currency: string;
  language: string;
  termsAndConditions?: string;
}

export interface SuperAdminInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatarUrl?: string;
}

export interface EmailConfig {
  apiKey: string;
  senderName: string;
  senderEmail: string;
  replyToEmail?: string;
  isVerified: boolean;
}

export interface UddoktaPayConfig {
  storeId: string;
  signatureKey: string;
  webhookSecret: string;
  successUrl: string;
  cancelUrl: string;
  environment: "sandbox" | "production";
  isVerified: boolean;
}

export interface InvoiceSettings {
  prefix: string; // e.g. INV-2026-
  startingNumber: number;
  currency: string;
  dueDays: number; // e.g. 30
  taxRate: number; // e.g. 5
  invoiceFooter?: string;
  receiptFooter?: string;
}

export interface SystemSettings {
  systemInitialized: boolean;
  setupVersion: string;
  appVersion: string;
  installedAt?: string;
  installedBy?: string;
  company: CompanyInfo;
  email: EmailConfig;
  uddoktapay: UddoktaPayConfig;
  invoice: InvoiceSettings;
}
