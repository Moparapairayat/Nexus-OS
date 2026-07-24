"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const SEGMENT_LABEL_MAP: Record<string, string> = {
  admin: "Admin",
  client: "Client Portal",
  services: "Services",
  invoices: "Invoices",
  payments: "Payments",
  renewals: "Renewals",
  support: "Support Tickets",
  reports: "Reports & Analytics",
  notifications: "Notifications",
  settings: "System Settings",
  "audit-logs": "Audit Logs",
  profile: "User Profile",
  "change-password": "Password Security",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-muted-foreground">
      <Link href={segments[0] === "admin" ? "/admin" : "/client"} className="hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50">
        <Home className="h-3.5 w-3.5" />
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        const rawLabel = SEGMENT_LABEL_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">{rawLabel}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-none">
                {rawLabel}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
