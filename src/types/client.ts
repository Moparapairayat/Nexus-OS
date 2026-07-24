export type ClientStatus = "active" | "pending" | "suspended" | "archived" | "deleted";

export type ContactRole = "owner" | "billing" | "technical" | "support" | "custom";

export type FileCategory = "contract" | "identity" | "business" | "screenshot" | "other";

export interface ClientContact {
  id: string;
  clientId: string;
  name: string;
  role: ContactRole;
  email: string;
  phone?: string;
  whatsapp?: string;
  notes?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  isPinned: boolean;
  createdBy: string;
  editedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFile {
  id: string;
  clientId: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  category: FileCategory;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ClientActivity {
  id: string;
  clientId: string;
  type: "created" | "updated" | "contact_added" | "note_added" | "file_uploaded" | "status_changed";
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  companyLogo?: string;
  businessRegNo?: string;
  website?: string;
  industry?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  billingAddress?: string;
  country: string;
  city?: string;
  postalCode?: string;
  taxNumber?: string;
  preferredCurrency: string;
  preferredLanguage: string;
  timezone: string;
  clientStatus: ClientStatus;
  accountStatus: "active" | "suspended" | "pending";
  notes?: string;
  tags: string[];
  assignedManagerId?: string;
  assignedManagerName?: string;
  createdAt: string;
  updatedAt: string;

  // Nested collections
  contacts?: ClientContact[];
  adminNotes?: ClientNote[];
  files?: ClientFile[];
  activities?: ClientActivity[];
}

export interface ClientFilters {
  search?: string;
  status?: ClientStatus | "all";
  country?: string;
  currency?: string;
  language?: string;
  tag?: string;
  sortBy?: "name" | "companyName" | "createdAt" | "clientStatus";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
