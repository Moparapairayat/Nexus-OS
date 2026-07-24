import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lock, ShieldAlert, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <Card variant="glass" className="p-4 text-center max-w-md mx-auto space-y-4">
      <CardHeader className="space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">Registration Restricted</CardTitle>
        <CardDescription>
          NexusOS is an enterprise private client portal. Public registration is not permitted.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-xs text-muted-foreground">
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-left space-y-1.5">
          <span className="font-semibold text-foreground block flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-500" /> Account Provisioning Policy
          </span>
          <p className="leading-relaxed">
            All client accounts and access tokens are provisioned directly by an Administrator. If you are a client expecting access, please check your inbox for an official invitation link.
          </p>
        </div>

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
