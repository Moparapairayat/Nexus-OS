"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

function getAdmin() {
  return createAdminClient() as any;
}

export async function impersonateClientAction(clientId: string) {
  const adminUser = await requireAdmin();
  const supabase = getAdmin();

  // Fetch client details
  const { data: client, error } = await supabase
    .from("clients")
    .select("id, full_name, company_name, primary_email")
    .eq("id", clientId)
    .single();

  if (error || !client) {
    return { success: false, error: "Client record not found." };
  }

  const cookieStore = await cookies();
  cookieStore.set("nexusos_impersonate_client_id", clientId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours session max
  });

  // Record audit log
  await supabase.from("security_events").insert({
    actor_id: adminUser.id !== "setup-admin-id" ? adminUser.id : null,
    actor_name: adminUser.fullName || adminUser.email,
    action: `Admin 1-Click Login to Client Portal [${client.company_name || client.full_name}]`,
    category: "security",
    severity: "warning",
    status: "success",
    metadata: { clientId: client.id, clientEmail: client.primary_email },
  });

  revalidatePath("/client");
  revalidatePath("/admin");

  return {
    success: true,
    redirectUrl: "/client",
    clientName: client.company_name || client.full_name,
  };
}

export async function exitImpersonationAction() {
  const cookieStore = await cookies();
  cookieStore.delete("nexusos_impersonate_client_id");

  revalidatePath("/client");
  revalidatePath("/admin");

  return { success: true, redirectUrl: "/admin/clients" };
}
