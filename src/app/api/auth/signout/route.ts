import { NextRequest, NextResponse } from "next/server";
import { signOutAction } from "@/features/auth/actions/sign-out-action";

export async function POST(request: NextRequest) {
  try {
    let scope: "global" | "local" = "local";

    try {
      const body = await request.json();
      if (body?.scope === "global") {
        scope = "global";
      }
    } catch {
      // Body empty or non-JSON, default to local
    }

    const result = await signOutAction(scope);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Signed out successfully" });
  } catch (error) {
    console.error("POST /api/auth/signout error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during signout" },
      { status: 500 }
    );
  }
}
