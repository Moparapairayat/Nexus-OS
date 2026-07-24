import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, ArrowLeft } from "lucide-react";

export default function InvitationExpiredPage() {
  return (
    <Card variant="glass" className="p-4 text-center max-w-md mx-auto space-y-4">
      <CardHeader className="space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Clock className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">Invitation Expired or Revoked</CardTitle>
        <CardDescription>
          This invitation token is no longer valid. Invitation links expire after 7 days or can be revoked by an Administrator.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        <p className="text-muted-foreground">
          Please contact your NexusOS Administrator to request a new invitation link.
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
