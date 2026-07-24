"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { updateProfileSchema, UpdateProfileInput } from "../schemas/auth-schemas";
import { requireAuth } from "@/lib/auth/session";

export const updateProfileAction = createSafeAction(
  updateProfileSchema,
  async (data: UpdateProfileInput) => {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const updatePayload: Record<string, any> = {
      full_name: data.fullName,
      updated_at: new Date().toISOString(),
    };

    if (data.companyName !== undefined) updatePayload.company_name = data.companyName || null;
    if (data.phone !== undefined) updatePayload.phone = data.phone || null;
    if (data.timezone !== undefined) updatePayload.timezone = data.timezone;
    if (data.language !== undefined) updatePayload.language = data.language;
    if (data.avatarUrl !== undefined) updatePayload.avatar_url = data.avatarUrl || null;

    const { data: updatedProfile, error } = await (supabase as any)
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Failed to update profile details.");
    }

    // Sync metadata in Supabase Auth user object
    await supabase.auth.updateUser({
      data: {
        full_name: data.fullName,
        company_name: data.companyName || null,
      },
    });

    return {
      profile: updatedProfile,
      message: "Profile updated successfully.",
    };
  }
);
