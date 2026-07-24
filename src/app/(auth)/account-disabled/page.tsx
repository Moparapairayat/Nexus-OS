import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function AccountDisabledPage() {
  return (
    <Card variant="glass" className="p-4 text-center max-w-md mx-auto space-y-4">
      <CardHeader className="space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">Account Suspended or Disabled</CardTitle>
        <CardDescription>
          Your client portal access has been temporarily suspended by an Administrator.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        <p className="text-muted-foreground">
          If you believe this is in error or wish to reactivate your access, please contact support or your account executive.
        </p>

        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Return to Sign In
        </Link>
      </CardContent>
    </Card>
  );
}
