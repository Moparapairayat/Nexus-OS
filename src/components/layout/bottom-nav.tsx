"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  Users,
  CreditCard,
  Bell,
  Settings,
  BarChart3,
  User,
} from "lucide-react";

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Support", href: "/admin/support", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const clientNavItems = [
  { label: "Home", href: "/client", icon: LayoutDashboard },
  { label: "Services", href: "/client/services", icon: Package },
  { label: "Invoices", href: "/client/invoices", icon: FileText },
  { label: "Support", href: "/client/support", icon: MessageSquare },
  { label: "Profile", href: "/client/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const navItems = isAdmin ? adminNavItems : clientNavItems;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/client")) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-13 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin" || item.href === "/client"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-medium transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-1 h-1 w-1 rounded-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )}
              />
              <span className="truncate max-w-[3.5rem] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
