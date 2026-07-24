"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signOutAction(scope: "global" | "local" = "local") {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut({
      scope: scope === "global" ? "global" : "local",
    });

    return { success: true };
  } catch (error) {
    console.error("Sign out action error:", error);
    return { success: false, error: "Failed to sign out session." };
  }
}
