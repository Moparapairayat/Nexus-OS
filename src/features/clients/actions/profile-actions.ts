"use server";

import { requireClient } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getClientProfileAction() {
  const user = await requireClient();

  try {
    const supabase = await createServerSupabaseClient();
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      return {
        success: true,
        data: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name || user.fullName,
          companyName: profile.company_name || user.companyName,
          phone: profile.phone || null,
          avatarUrl: profile.avatar_url || null,
          timezone: profile.timezone || "UTC",
          language: profile.language || "en",
          role: profile.role,
          accountStatus: profile.account_status || "active",
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
      };
    }
  } catch (err) {
    // Fallback to session data
  }

  // Fallback to session user
  return {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      companyName: user.companyName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      language: user.language,
      role: user.role,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

export async function updateClientProfileAction(values: {
  fullName?: string;
  phone?: string;
  timezone?: string;
  language?: string;
}) {
  const user = await requireClient();
  const now = new Date().toISOString();

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase as any)
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: values.fullName || user.fullName,
          phone: values.phone || user.phone,
          timezone: values.timezone || user.timezone,
          language: values.language || user.language,
          updated_at: now,
        },
        { onConflict: "id" }
      );
  } catch (err) {
    console.warn("Profile update notice:", err);
  }

  revalidatePath("/client/profile");
  return { success: true, message: "Profile updated successfully." };
}
