import { NextResponse } from "next/server";
import { runSupabaseHealthCheck } from "@/lib/supabase/health";

export async function GET() {
  try {
    const healthReport = await runSupabaseHealthCheck();
    const httpStatus = healthReport.overallStatus === "healthy" ? 200 : 503;

    return NextResponse.json(
      {
        success: healthReport.overallStatus === "healthy",
        app: "NexusOS Enterprise",
        version: "1.0.0-enterprise",
        health: healthReport,
      },
      { status: httpStatus }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Health check execution failed.",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
