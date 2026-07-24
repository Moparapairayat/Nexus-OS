export type ServiceStatus =
  | "draft"
  | "pending"
  | "provisioning"
  | "active"
  | "suspended"
  | "expired"
  | "cancelled"
  | "archived";

export type BillingCycle =
  | "one_time"
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual"
  | "biennial";

export type ServiceFileCategory =
  | "contract"
  | "setup_guide"
  | "credentials"
  | "image"
  | "pdf"
  | "zip"
  | "other";

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  color?: string;
  createdAt: string;
}

export interface ServiceTemplate {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  iconName: string;
  defaultPrice: number;
  currency: string;
  billingCycle: BillingCycle;
  renewable: boolean;
  autoRenewal: boolean;
  visibility: "public" | "private";
  status: "active" | "draft" | "archived";
  defaultNotes?: string;
  tags: string[];
  createdAt: string;
}

export interface ServiceRenewal {
  id: string;
  serviceId: string;
  renewalDate: string;
  billingCycle: BillingCycle;
  renewalCost: number;
  currency: string;
  autoRenewal: boolean;
  reminderSchedule: string;
  status: "scheduled" | "completed" | "failed" | "skipped";
  createdAt: string;
}

export interface ServiceFile {
  id: string;
  serviceId: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  category: ServiceFileCategory;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ServiceActivity {
  id: string;
  serviceId: string;
  type:
    | "created"
    | "assigned"
    | "activated"
    | "updated"
    | "renewed"
    | "suspended"
    | "reactivated"
    | "cancelled"
    | "expired";
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface ServiceCredential {
  id: string;
  serviceId: string;
  credentialName: string;
  username?: string;
  password?: string;
  loginUrl?: string;
  apiKey?: string;
  licenseKey?: string;
  secretNotes?: string;
  isClientVisible: boolean;
  createdAt: string;
}

export interface ClientService {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  templateId?: string;
  customName: string;
  categoryId: string;
  categoryName: string;
  customPrice: number;
  currency: string;
  billingCycle: BillingCycle;
  purchaseDate: string;
  activationDate?: string;
  renewalDate?: string;
  expirationDate?: string;
  serviceStatus: ServiceStatus;
  autoRenewal: boolean;
  internalNotes?: string;
  clientNotes?: string;
  tags: string[];
  metadata?: Record<string, any>;
  domainName?: string;
  serverIp?: string;
  cloudflareZoneId?: string;

  // Nested collections
  renewals?: ServiceRenewal[];
  files?: ServiceFile[];
  activities?: ServiceActivity[];
  credentials?: ServiceCredential[];
  createdAt?: string;
}

export interface ServiceFilters {
  search?: string;
  status?: ServiceStatus | "all";
  categoryId?: string;
  clientId?: string;
  billingCycle?: BillingCycle | "all";
  currency?: string;
  tag?: string;
  expiringSoonDays?: number;
  sortBy?: "customName" | "clientName" | "renewalDate" | "customPrice" | "serviceStatus";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
