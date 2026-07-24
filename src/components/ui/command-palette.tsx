"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Command,
  ArrowRight,
  User,
  Settings,
  LayoutDashboard,
  Shield,
  FileText,
  CreditCard,
  Globe,
  Cloud,
  Server,
  HelpCircle,
  ShieldAlert,
  Key,
} from "lucide-react";
import { Input } from "./input";
import { Kbd } from "./kbd";

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  perform?: () => void;
  href?: string;
  category: "Navigation" | "Clients" | "Services" | "Billing" | "Infrastructure" | "Support" | "Governance";
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const defaultCommands: CommandItem[] = [
    {
      id: "admin-dashboard",
      title: "Admin Dashboard",
      subtitle: "System overview, active clients & revenue metrics",
      icon: <LayoutDashboard className="h-4 w-4 text-blue-500" />,
      category: "Navigation",
      href: "/admin",
    },
    {
      id: "client-portal",
      title: "Client Portal Dashboard",
      subtitle: "View active client services & tickets",
      icon: <User className="h-4 w-4 text-emerald-500" />,
      category: "Navigation",
      href: "/client",
    },
    {
      id: "clients-list",
      title: "Search Clients Directory",
      subtitle: "View all client profiles and account numbers",
      icon: <User className="h-4 w-4 text-indigo-500" />,
      category: "Clients",
      href: "/admin/clients",
    },
    {
      id: "services-list",
      title: "Active Managed Services",
      subtitle: "Manage hosting, domains, cloudflare & email retainers",
      icon: <Server className="h-4 w-4 text-purple-500" />,
      category: "Services",
      href: "/admin/services",
    },
    {
      id: "domain-search",
      title: "Domain Names & DNS",
      subtitle: "Check registered domain statuses and renewals",
      icon: <Globe className="h-4 w-4 text-cyan-500" />,
      category: "Infrastructure",
      href: "/admin/services",
    },
    {
      id: "cloudflare-search",
      title: "Cloudflare & CDN Security",
      subtitle: "Manage WAF rules, SSL certificates, and DDoS settings",
      icon: <Cloud className="h-4 w-4 text-amber-500" />,
      category: "Infrastructure",
      href: "/admin/services",
    },
    {
      id: "invoices-list",
      title: "Invoices & Receipts",
      subtitle: "View unpaid, paid, and overdue invoices",
      icon: <FileText className="h-4 w-4 text-emerald-500" />,
      category: "Billing",
      href: "/admin/invoices",
    },
    {
      id: "payments-list",
      title: "Payments & UddoktaPay Gateway",
      subtitle: "View recent transaction receipts and payment history",
      icon: <CreditCard className="h-4 w-4 text-green-500" />,
      category: "Billing",
      href: "/admin/payments",
    },
    {
      id: "support-tickets",
      title: "Support Tickets Queue",
      subtitle: "Respond to open client support tickets and requests",
      icon: <HelpCircle className="h-4 w-4 text-amber-500" />,
      category: "Support",
      href: "/admin/support",
    },
    {
      id: "audit-logs",
      title: "System Audit Logs",
      subtitle: "Inspect security logs, login attempts, and permission changes",
      icon: <ShieldAlert className="h-4 w-4 text-rose-500" />,
      category: "Governance",
      href: "/admin/audit-logs",
    },
    {
      id: "change-password",
      title: "Password & Security Settings",
      subtitle: "Update account credentials and authentication options",
      icon: <Key className="h-4 w-4 text-blue-500" />,
      category: "Governance",
      href: "/change-password",
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredCommands = defaultCommands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(search.toLowerCase())) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (cmd: CommandItem) => {
    setIsOpen(false);
    setSearch("");
    if (cmd.perform) {
      cmd.perform();
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog Window */}
      <div className="relative z-50 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl glass-panel animate-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 border-b border-border/60">
          <Search className="h-4 w-4 text-muted-foreground mr-2.5 shrink-0" />
          <Input
            type="text"
            placeholder="Type a command or search clients, services, invoices, tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 border-none bg-transparent focus-visible:ring-0 text-xs sm:text-sm"
            autoFocus
          />
          <Kbd className="shrink-0">ESC</Kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No results matching &quot;<span className="text-foreground font-semibold">{search}</span>&quot;
            </div>
          ) : (
            filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => handleSelect(cmd)}
                className="flex w-full items-center justify-between p-2.5 rounded-xl hover:bg-muted/80 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 shrink-0">
                    {cmd.icon || <Command className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {cmd.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/70 px-1.5 py-0.2 rounded bg-muted/60 shrink-0">
                        {cmd.category}
                      </span>
                    </div>
                    {cmd.subtitle && <p className="text-[11px] text-muted-foreground truncate">{cmd.subtitle}</p>}
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 bg-muted/30 text-[11px] text-muted-foreground">
          <span>NexusOS Command Palette</span>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd> Select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
