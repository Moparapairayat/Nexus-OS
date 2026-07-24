"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { User, LogOut, Shield, Key, Palette, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { signOutAction } from "@/features/auth/actions/sign-out-action";

export function NavUser() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roleLabel = user?.role === "admin" ? "Admin" : "Client Portal";

  const handleSignOut = async (scope: "local" | "global" = "local") => {
    setIsOpen(false);
    await signOutAction(scope);
    await signOut(scope);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 h-auto rounded-xl hover:bg-muted/80 transition-colors"
      >
        <Avatar src={user?.avatarUrl} fallback={user?.fullName || user?.email} size="sm" />
        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-semibold text-foreground leading-none truncate max-w-[130px]">
            {user?.fullName || user?.email || "Account User"}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">{roleLabel}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
      </Button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40"
        />
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-60 rounded-2xl glass-panel bg-popover text-popover-foreground p-2 shadow-2xl border border-border/80 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2.5 border-b border-border/60">
            <p className="text-[11px] font-medium text-muted-foreground">Signed in as</p>
            <p className="text-xs font-semibold truncate text-foreground mt-0.5">
              {user?.email || "guest@nexusos.io"}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant={user?.role === "admin" ? "glow" : "secondary"}>
                <Shield className="mr-1 h-3 w-3 inline" />
                {roleLabel}
              </Badge>
              {user?.companyName && (
                <span className="text-[10px] text-muted-foreground truncate max-w-[100px] font-medium">
                  {user.companyName}
                </span>
              )}
            </div>
          </div>

          <div className="py-1.5 space-y-0.5 border-b border-border/60">
            <Link
              href={user?.role === "admin" ? "/admin/settings" : "/client/profile"}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              <span>User Profile</span>
            </Link>

            <Link
              href="/change-password"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Key className="h-3.5 w-3.5 text-amber-500" />
              <span>Password & Security</span>
            </Link>
          </div>

          <div className="py-1 space-y-0.5">
            <button
              onClick={() => handleSignOut("local")}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out This Device</span>
            </button>

            <button
              onClick={() => handleSignOut("global")}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Globe className="h-3 w-3" /> Sign Out All Devices
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
