"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationConfig } from "@/config/nav";
import { UserRole, USER_ROLES } from "@/constants/auth";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Boxes,
  Star,
  Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role?: UserRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  role = USER_ROLES.CLIENT,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;

  const handleToggle = () => {
    if (externalToggleCollapse) {
      externalToggleCollapse();
    } else {
      setInternalIsCollapsed((prev) => !prev);
    }
  };

  const navSections = navigationConfig[role] || [];

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border/80 bg-card/40 backdrop-blur-xl transition-all duration-300 z-30 h-screen sticky top-0 shrink-0 select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
        <Link href={role === "admin" ? "/admin" : "/client"} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 shrink-0">
            <Boxes className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-foreground truncate">
                {siteConfig.name}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                {role} Portal
              </span>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Favorites / Pinned Items Section (Future-Ready UI) */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-1 border-b border-border/40">
          <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500/20" /> Pinned Views
            </span>
          </div>
          <div className="space-y-0.5">
            <Link
              href={role === "admin" ? "/admin/clients" : "/client/services"}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <span className="truncate">{role === "admin" ? "Active Clients" : "My Active Services"}</span>
              <Pin className="h-3 w-3 text-muted-foreground/50 rotate-45" />
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && !isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                {section.title}
              </h4>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && item.href !== "/client" && pathname.startsWith(item.href));
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems[item.title];

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                    isCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {!isCollapsed && <span className="flex-1 truncate">{item.title}</span>}
                  {!isCollapsed && item.badge && (
                    <Badge variant={isActive ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );

              return (
                <div key={item.href} className="space-y-1">
                  <div className="flex items-center">
                    {isCollapsed ? (
                      <Tooltip content={item.title} position="right" className="z-50">
                        {linkContent}
                      </Tooltip>
                    ) : (
                      linkContent
                    )}

                    {!isCollapsed && hasSubItems && (
                      <button
                        onClick={() => toggleExpand(item.title)}
                        className="p-2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Sub-items */}
                  {!isCollapsed && hasSubItems && isExpanded && (
                    <div className="pl-9 pr-2 space-y-1 pt-1 border-l-2 border-border/40 ml-4">
                      {item.subItems?.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                              isSubActive
                                ? "text-primary font-semibold bg-primary/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                          >
                            <span className="truncate">{sub.title}</span>
                            {sub.badge && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0">
                                {sub.badge}
                              </Badge>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
