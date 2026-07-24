"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { forgotPasswordSchema, ForgotPasswordInput } from "../schemas/auth-schemas";
import { checkRateLimit } from "@/lib/auth/rate-limiter";
import { env } from "@/config/env";

export const forgotPasswordAction = createSafeAction(
  forgotPasswordSchema,
  async (data: ForgotPasswordInput) => {
    // Rate Limiting Check (3 requests per minute per email)
    const rateLimit = checkRateLimit(`forgot:${data.email.toLowerCase()}`, 3, 60 * 1000);
    if (!rateLimit.success) {
      throw new Error("Too many password reset requests. Please wait 1 minute.");
    }

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      throw new Error(error.message || "Failed to dispatch password recovery email.");
    }

    return {
      message: `Password recovery link has been dispatched to ${data.email}.`,
    };
  }
);
