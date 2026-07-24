"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { resendVerificationSchema, ResendVerificationInput } from "../schemas/auth-schemas";
import { checkRateLimit } from "@/lib/auth/rate-limiter";
import { env } from "@/config/env";

export const resendVerificationAction = createSafeAction(
  resendVerificationSchema,
  async (data: ResendVerificationInput) => {
    // Rate Limiting Check (2 resend attempts per 2 minutes)
    const rateLimit = checkRateLimit(`resend-verification:${data.email.toLowerCase()}`, 2, 2 * 60 * 1000);
    if (!rateLimit.success) {
      throw new Error("Too many verification requests. Please wait 2 minutes before trying again.");
    }

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: data.email,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message || "Failed to resend verification email.");
    }

    return {
      message: `A new verification email link has been sent to ${data.email}.`,
    };
  }
);
