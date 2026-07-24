import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/env";
import { USER_ROLES } from "@/constants/auth";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Authenticate user via Supabase Auth server call (never trust local payload)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Extract user role securely
  const userRole = user?.user_metadata?.role || USER_ROLES.CLIENT;

  // Protect Admin Routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!user) {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Privilege Escalation Prevention: Only Admin role permitted
    if (userRole !== USER_ROLES.ADMIN) {
      url.pathname = "/client";
      return NextResponse.redirect(url);
    }
  }

  // Protect Client Portal Routes (/client/*)
  if (pathname.startsWith("/client")) {
    if (!user) {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect Protected API Routes (/api/* except public auth callbacks/sessions)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (pathname.startsWith("/api/admin/") && userRole !== USER_ROLES.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin privilege required" },
        { status: 403 }
      );
    }
  }

  // Redirect logged-in users away from auth pages (/login, /register, /forgot-password)
  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(pathname);
  if (isAuthPage && user) {
    url.pathname = userRole === USER_ROLES.ADMIN ? "/admin" : "/client";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
