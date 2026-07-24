import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { USER_ROLES } from "@/constants/auth";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/client";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      const userRole = (user.user_metadata?.role as string) || USER_ROLES.CLIENT;

      // Auto-provision or update public.profiles
      await (supabase as any).from("profiles").upsert(
        {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          company_name: user.user_metadata?.company_name || null,
          role: userRole as any,
          account_status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      const destination = userRole === USER_ROLES.ADMIN ? "/admin" : next;
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=AuthCallbackFailed", request.url));
}
