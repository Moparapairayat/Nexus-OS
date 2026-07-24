export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface ClientInvitation {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  email: string;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
  revokedAt?: string;
}

export interface ValidateTokenResult {
  valid: boolean;
  error?: string;
  invitation?: ClientInvitation;
}
