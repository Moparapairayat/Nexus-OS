import React from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { USER_ROLES } from "@/constants/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  // Privilege Escalation Prevention: Only Admin role permitted
  if (user.role !== USER_ROLES.ADMIN) {
    redirect("/client");
  }

  return <AppShell role="admin">{children}</AppShell>;
}
