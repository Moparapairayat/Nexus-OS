"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { changePasswordSchema, ChangePasswordInput } from "../schemas/auth-schemas";
import { requireAuth } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limiter";

export const changePasswordAction = createSafeAction(
  changePasswordSchema,
  async (data: ChangePasswordInput) => {
    const user = await requireAuth();

    // Rate Limiting Check (3 attempts per minute per user)
    const rateLimit = checkRateLimit(`change-password:${user.id}`, 3, 60 * 1000);
    if (!rateLimit.success) {
      throw new Error("Too many password update attempts. Please wait 1 minute.");
    }

    const supabase = await createServerSupabaseClient();

    // First verify current password by attempting re-authentication
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: data.currentPassword,
    });

    if (signInError) {
      throw new Error("Incorrect current password.");
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (updateError) {
      throw new Error(updateError.message || "Failed to change password.");
    }

    return {
      message: "Password changed successfully.",
    };
  }
);
