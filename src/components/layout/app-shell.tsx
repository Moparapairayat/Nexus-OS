"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { CommandPalette } from "../ui/command-palette";
import { UserRole, USER_ROLES } from "@/constants/auth";
import { siteConfig } from "@/config/site";
import { Sheet } from "../ui/sheet";

export interface AppShellProps {
  role?: UserRole;
  children: React.ReactNode;
}

export function AppShell({ role = USER_ROLES.CLIENT, children }: AppShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* Next-Gen Ambient Glow Backdrops */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
        {/* Top-Right Purple Glow Spot */}
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-transparent blur-3xl opacity-70 dark:opacity-60" />
        
        {/* Bottom-Left Cyan Glow Spot */}
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-indigo-600/10 to-transparent blur-3xl opacity-60 dark:opacity-50" />

        {/* Ambient Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-30" />
      </div>

      {/* Collapsible Sidebar (Desktop & Tablet) */}
      <div className="hidden md:block z-20">
        <Sidebar role={role} />
      </div>

      {/* Mobile Drawer Navigation */}
      <Sheet
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        side="left"
      >
        <div className="-m-6">
          <Sidebar role={role} isCollapsed={false} />
        </div>
      </Sheet>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header onOpenMobileNav={() => setMobileDrawerOpen(true)} />

        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Minimal Footer */}
        <footer className="border-t border-border/60 py-3 px-6 text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2 bg-background/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold text-foreground">{siteConfig.name} Enterprise</span>
            <span>&bull; All Systems Operational</span>
          </div>
          <div>&copy; {new Date().getFullYear()} {siteConfig.company.name}. All rights reserved.</div>
        </footer>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Mobile Navigation Bar */}
      <BottomNav />
    </div>
  );
}
