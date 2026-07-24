"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { registerSchema, RegisterInput } from "../schemas/auth-schemas";
import { checkRateLimit } from "@/lib/auth/rate-limiter";
import { env } from "@/config/env";

export const registerAction = createSafeAction(
  registerSchema,
  async (data: RegisterInput) => {
    // 1. Rate Limiting Check (3 registration attempts per minute)
    const rateLimit = checkRateLimit(`register:${data.email.toLowerCase()}`, 3, 60 * 1000);
    if (!rateLimit.success) {
      throw new Error("Too many registration attempts. Please wait 1 minute before trying again.");
    }

    const supabase = await createServerSupabaseClient();

    // 2. Supabase Auth Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          full_name: data.fullName,
          company_name: data.companyName || null,
          role: data.role,
        },
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create account. Please try again.");
    }

    const user = authData.user;

    // 3. Upsert into public.profiles
    await (supabase as any).from("profiles").upsert(
      {
        id: user.id,
        email: user.email!,
        full_name: data.fullName,
        company_name: data.companyName || null,
        role: data.role as any,
        account_status: authData.session ? "active" : "unverified",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    return {
      userId: user.id,
      email: user.email!,
      requiresEmailVerification: !authData.session,
    };
  }
);
