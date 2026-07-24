"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { resetPasswordSchema, ResetPasswordInput } from "../schemas/auth-schemas";

export const resetPasswordAction = createSafeAction(
  resetPasswordSchema,
  async (data: ResetPasswordInput) => {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      throw new Error(error.message || "Failed to reset password. Recovery token may be expired or invalid.");
    }

    return {
      message: "Your password has been successfully updated. You can now sign in with your new credentials.",
    };
  }
);
