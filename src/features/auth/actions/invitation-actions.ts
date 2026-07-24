"use server";

import { revalidatePath } from "next/cache";
import { ClientInvitation, ValidateTokenResult } from "@/types/invitation";
import { acceptInvitationSchema } from "../schemas/invitation-schema";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

// ── Helpers ────────────────────────────────────────────────────────────────

function getAdmin() {
  return createAdminClient() as any;
}

function mapRowToInvitation(row: any): ClientInvitation {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    companyName: row.company_name,
    email: row.email,
    token: row.token,
    status: row.status,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at || undefined,
    revokedAt: row.revoked_at || undefined,
    createdAt: row.created_at,
  };
}

// ── SEND INVITATION ────────────────────────────────────────────────────────

export async function sendClientInvitationAction(
  clientId: string,
  clientName: string,
  companyName: string,
  email: string
) {
  const user = await requireAdmin();
  const supabase = getAdmin();

  // Generate cryptographically secure token
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 15)}`;

  const token = `inv-tok-${randomPart}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Revoke all pending invitations for this client first
  await supabase
    .from("client_invitations")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .eq("status", "pending");

  // Create new invitation
  const { data, error } = await supabase
    .from("client_invitations")
    .insert({
      client_id: clientId,
      client_name: clientName,
      company_name: companyName,
      email,
      token,
      status: "pending",
      expires_at: expiresAt,
      created_by: user.id !== "setup-admin-id" ? user.id : null,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: `Failed to create invitation: ${error?.message}` };
  }

  revalidatePath("/admin/clients");

  return {
    success: true,
    data: {
      invitation: mapRowToInvitation(data),
      invitationUrl: `/accept-invitation?token=${token}`,
    },
  };
}

export async function resendClientInvitationAction(
  clientId: string,
  clientName: string,
  companyName: string,
  email: string
) {
  return sendClientInvitationAction(clientId, clientName, companyName, email);
}

// ── REVOKE ─────────────────────────────────────────────────────────────────

export async function revokeClientInvitationAction(clientId: string) {
  await requireAdmin();
  const supabase = getAdmin();

  const { error } = await supabase
    .from("client_invitations")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .eq("status", "pending");

  if (error) {
    return { success: false, error: `Failed to revoke invitation: ${error.message}` };
  }

  revalidatePath("/admin/clients");
  return { success: true };
}

// ── VALIDATE TOKEN ─────────────────────────────────────────────────────────

export async function validateInvitationTokenAction(token: string): Promise<ValidateTokenResult> {
  const supabase = getAdmin();

  const { data, error } = await supabase
    .from("client_invitations")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) {
    return { valid: false, error: "Invalid invitation token. This link does not exist." };
  }

  if (data.status === "accepted") {
    return { valid: false, error: "This invitation has already been accepted." };
  }

  if (data.status === "revoked") {
    return { valid: false, error: "This invitation link has been revoked by an administrator." };
  }

  if (new Date(data.expires_at) < new Date()) {
    // Mark as expired in DB
    await supabase
      .from("client_invitations")
      .update({ status: "expired" })
      .eq("id", data.id);
    return { valid: false, error: "This invitation link has expired. Please contact your administrator." };
  }

  return { valid: true, invitation: mapRowToInvitation(data) };
}

// ── ACCEPT INVITATION ──────────────────────────────────────────────────────

export async function acceptInvitationAction(rawValues: any) {
  const validation = acceptInvitationSchema.safeParse(rawValues);
  if (!validation.success) {
    return {
      success: false,
      error: "Password validation failed. Please check criteria.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { token, password } = validation.data;

  // Validate token
  const tokenValidation = await validateInvitationTokenAction(token);
  if (!tokenValidation.valid || !tokenValidation.invitation) {
    return { success: false, error: tokenValidation.error || "Token validation failed." };
  }

  const invitation = tokenValidation.invitation;
  const supabase = getAdmin();
  const clientEmail = invitation.email.toLowerCase().trim();
  const now = new Date().toISOString();

  let createdUserId: string | null = null;

  try {
    // Check if auth user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email?.toLowerCase() === clientEmail
    );

    if (existingUser) {
      createdUserId = existingUser.id;
      const { error: updateErr } = await supabase.auth.admin.updateUserById(createdUserId, {
        password,
        email_confirm: true,
        user_metadata: {
          full_name: invitation.clientName,
          company_name: invitation.companyName,
          role: "client",
        },
      });
      if (updateErr) {
        return { success: false, error: `Failed to update account: ${updateErr.message}` };
      }
    } else {
      // Create new Auth user
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: clientEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: invitation.clientName,
          company_name: invitation.companyName,
          role: "client",
        },
      });
      if (createErr) {
        return { success: false, error: `Account creation failed: ${createErr.message}` };
      }
      createdUserId = newUser?.user?.id || null;
    }

    // Upsert profile in public.profiles
    if (createdUserId) {
      await supabase.from("profiles").upsert(
        {
          id: createdUserId,
          email: clientEmail,
          full_name: invitation.clientName,
          company_name: invitation.companyName,
          role: "client",
          account_status: "active",
          updated_at: now,
        },
        { onConflict: "id" }
      );

      // Link auth user to clients table via profile_id
      await supabase
        .from("clients")
        .update({ profile_id: createdUserId })
        .eq("id", invitation.clientId)
        .is("profile_id", null);
    }
  } catch (err: any) {
    return { success: false, error: `Supabase error: ${err?.message || "Check service role key."}` };
  }

  // Mark invitation as accepted in DB
  await supabase
    .from("client_invitations")
    .update({ status: "accepted", accepted_at: now })
    .eq("id", invitation.id);

  // Update client status to active
  await supabase
    .from("clients")
    .update({ status: "active" })
    .eq("id", invitation.clientId);

  revalidatePath("/admin/clients");
  revalidatePath("/login");

  return {
    success: true,
    data: {
      clientEmail: invitation.email,
      companyName: invitation.companyName,
    },
  };
}
