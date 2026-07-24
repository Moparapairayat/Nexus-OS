import React from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/client");
  }

  return (
    <>
      {user.isImpersonating && (
        <ImpersonationBanner
          clientName={user.companyName || user.fullName || user.email}
          adminName={user.originalAdminName}
        />
      )}
      <AppShell role="client">{children}</AppShell>
    </>
  );
}
