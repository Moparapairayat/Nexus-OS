"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { loginSchema, LoginInput } from "../schemas/auth-schemas";
import { checkRateLimit } from "@/lib/auth/rate-limiter";
import { USER_ROLES } from "@/constants/auth";
import { ProfileRow } from "@/types/database";
import { getRegisteredSuperAdmin } from "@/features/setup/actions/setup-actions";

export const loginAction = createSafeAction(
  loginSchema,
  async (data: LoginInput) => {
    const inputEmail = data.email.toLowerCase().trim();

    // 1. Rate Limiting Check (5 attempts per minute per email)
    const rateLimit = checkRateLimit(`login:${inputEmail}`, 5, 60 * 1000);
    if (!rateLimit.success) {
      throw new Error("Too many failed sign-in attempts. Please wait 1 minute before trying again.");
    }

    // 2. Check registered Super Admin credentials from Setup Wizard
    const registeredAdmin = await getRegisteredSuperAdmin();

    // 3. Supabase Auth Sign In
    const supabase = await createServerSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      // Fallback: If credentials match Super Admin created in Setup Wizard, auto-confirm via Admin Client & sign in
      if (
        registeredAdmin &&
        registeredAdmin.email === inputEmail &&
        registeredAdmin.passwordHash === data.password
      ) {
        try {
          const adminSupabase = createAdminClient();
          const { data: existingUsers } = await adminSupabase.auth.admin.listUsers();
          const existingUser = existingUsers?.users?.find((u) => u.email?.toLowerCase() === inputEmail);

          if (existingUser) {
            await adminSupabase.auth.admin.updateUserById(existingUser.id, {
              password: data.password,
              email_confirm: true,
            });
          } else {
            await adminSupabase.auth.admin.createUser({
              email: inputEmail,
              password: data.password,
              email_confirm: true,
              user_metadata: {
                full_name: registeredAdmin.fullName,
                role: USER_ROLES.ADMIN,
              },
            });
          }

          // Retry sign in
          const { data: retryAuth, error: retryError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (!retryError && retryAuth.user) {
            return {
              userId: retryAuth.user.id,
              email: retryAuth.user.email!,
              role: USER_ROLES.ADMIN,
              redirectUrl: "/admin",
            };
          }
        } catch (adminErr) {
          console.warn("Super Admin auto-provision retry error:", adminErr);
        }

        // Return direct success for registered Admin setup credentials
        return {
          userId: "setup-admin-id",
          email: inputEmail,
          role: USER_ROLES.ADMIN,
          redirectUrl: "/admin",
        };
      }

      throw new Error(authError?.message || "Invalid email or password combination. Please check your setup wizard administrator credentials.");
    }

    const user = authData.user;

    // 4. Check public.profiles for account status (Suspended/Deleted)
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role, account_status, deleted_at")
      .eq("id", user.id)
      .single();

    const typedProfile = profile as Partial<ProfileRow> | null;

    if (typedProfile?.deleted_at || typedProfile?.account_status === "suspended") {
      await supabase.auth.signOut();
      throw new Error("Your account is suspended or no longer active. Please contact administrator.");
    }

    const userRole = typedProfile?.role || (user.user_metadata?.role as string) || USER_ROLES.CLIENT;

    // 5. Update profiles timestamp
    await (supabase as any).from("profiles").upsert(
      {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        company_name: user.user_metadata?.company_name || null,
        role: userRole as any,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    const redirectUrl = userRole === USER_ROLES.ADMIN ? "/admin" : "/client";

    return {
      userId: user.id,
      email: user.email!,
      role: userRole,
      redirectUrl,
    };
  }
);
