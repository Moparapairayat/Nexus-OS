export type VaultCategory =
  | "invoices"
  | "receipts"
  | "contracts"
  | "identity"
  | "hosting"
  | "ssl"
  | "domains"
  | "screenshots"
  | "backups"
  | "support"
  | "general";

export interface VaultFileRecord {
  id: string;
  clientId?: string;
  companyName?: string;
  clientName?: string;
  serviceId?: string;
  serviceName?: string;
  invoiceId?: string;
  ticketId?: string;
  name: string;
  originalName: string;
  category: VaultCategory;
  fileType: string;
  fileSize: string;
  fileSizeBytes: number;
  storagePath: string;
  downloadUrl?: string;
  tags?: string[];
  downloadCount: number;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultFileLog {
  id: string;
  fileId: string;
  clientId?: string;
  action: "uploaded" | "downloaded" | "renamed" | "categorized" | "deleted";
  actorName: string;
  createdAt: string;
}

export interface VaultStorageStats {
  totalStorageBytes: number;
  totalStorageFormatted: string;
  totalFilesCount: number;
  categoryBreakdown: { category: string; count: number; bytes: number }[];
}

export interface VaultFilters {
  search?: string;
  category?: VaultCategory | "all";
  clientId?: string;
  serviceId?: string;
  page?: number;
  limit?: number;
}
