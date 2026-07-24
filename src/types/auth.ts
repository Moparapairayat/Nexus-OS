import { UserRole } from "@/constants/auth";

export type AccountStatus = "active" | "suspended" | "unverified";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  phone: string | null;
  companyName: string | null;
  timezone: string | null;
  language: string | null;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
  isImpersonating?: boolean;
  impersonatedClientId?: string;
  originalAdminName?: string;
}

export interface AuthSession {
  user: UserProfile | null;
  accessToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}
