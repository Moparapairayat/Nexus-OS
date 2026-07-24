export interface CompanySettings {
  companyName: string;
  businessEmail: string;
  phone: string;
  website: string;
  address: string;
  country: string;
  timezone: string;
  currency: string;
  taxNumber?: string;
  termsAndConditions?: string;
}

export interface BrandingSettings {
  primaryColor: string;
  accentColor: string;
  lightLogo: string;
  darkLogo: string;
}

export interface InvoiceSettings {
  invoicePrefix: string;
  startingNumber: number;
  dueDays: number;
  currency: string;
  footerText: string;
}

export interface EmailSettings {
  apiKey?: string;
  senderName: string;
  senderEmail: string;
  replyTo: string;
}

export interface SecuritySettings {
  minPasswordLength: number;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  require2FA: boolean;
}

export interface FeatureFlagRecord {
  id: string;
  key: string;
  name: string;
  description: string;
  category: "beta" | "experimental" | "module" | "general";
  isEnabled: boolean;
  updatedAt: string;
}

export interface SystemAuditLogRecord {
  id: string;
  actorId?: string;
  actorName: string;
  action: string;
  category: "settings" | "security" | "billing" | "user_management";
  details?: any;
  createdAt: string;
}

export interface FullSystemSettingsPayload {
  company: CompanySettings;
  branding: BrandingSettings;
  invoices: InvoiceSettings;
  email: EmailSettings;
  security: SecuritySettings;
}
