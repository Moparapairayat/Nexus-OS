import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lock, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <Card variant="glass" className="p-4 text-center max-w-md mx-auto space-y-4">
      <CardHeader className="space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">403 — Unauthorized Access</CardTitle>
        <CardDescription>
          You do not have the required role permissions to access this page.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        <p className="text-muted-foreground">
          Client accounts are restricted to the Client Portal. Privilege escalation is strictly prevented.
        </p>

        <Link
          href="/client"
          className="inline-flex w-full items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Return to My Portal
        </Link>
      </CardContent>
    </Card>
  );
}
