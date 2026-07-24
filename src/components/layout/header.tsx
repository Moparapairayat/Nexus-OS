"use client";

import React, { useState, useEffect } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { ThemeToggle } from "./theme-toggle";
import { NavUser } from "./nav-user";
import { NotificationPanel } from "./notification-panel";
import { GlobalSearchModal } from "@/components/client/global-search-modal";
import { Menu, Search, Bell, Plus, Building2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

export interface HeaderProps {
  onOpenMobileNav?: () => void;
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const quickActionItems = [
    { id: "create-client", label: "Add New Client", onClick: () => alert("Add Client Action") },
    { id: "create-service", label: "Provision Service", onClick: () => alert("Provision Service Action") },
    { id: "create-invoice", label: "Generate Invoice", onClick: () => alert("Generate Invoice Action") },
    { id: "create-ticket", label: "Open Support Ticket", onClick: () => alert("Open Ticket Action") },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/70 px-4 md:px-6 backdrop-blur-xl transition-all">
        {/* Left Area: Mobile Menu Trigger + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobileNav && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenMobileNav}
              className="md:hidden h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </Button>
          )}

          {/* Organization Switcher */}
          <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-border/60">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">Nexus Enterprise</span>
          </div>

          <Breadcrumbs />
        </div>

        {/* Right Area: Search Trigger, Quick Action, Notifications, Theme, NavUser */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="md:hidden h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Global Search Trigger (Cmd+K / Ctrl+K) - Desktop */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl border border-input bg-background/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer shadow-xs"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
            <Kbd className="ml-1">⌘K</Kbd>
          </button>

          {/* Quick Action Button */}
          <div className="hidden sm:block">
            <DropdownMenu
              trigger={
                <Button variant="outline" size="sm" className="h-9 px-2.5 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1 text-primary" />
                  <span>Create</span>
                  <ChevronDown className="h-3 w-3 ml-1 opacity-60" />
                </Button>
              }
              items={quickActionItems}
              align="right"
            />
          </div>

          {/* Notifications Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationOpen(true)}
            className="relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="sr-only">Notifications</span>
          </Button>

          <ThemeToggle />

          <div className="hidden sm:block h-4 w-px bg-border/60 mx-0.5" />

          <NavUser />
        </div>
      </header>

      {/* Slide-out Notification Drawer */}
      <NotificationPanel
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
