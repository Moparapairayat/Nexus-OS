"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  className?: string;
}

export function Tabs({ items, defaultTabId, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTabId || items[0]?.id);

  const activeContent = items.find((item) => item.id === activeTab)?.content;

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex border-b border-border space-x-1 overflow-x-auto no-scrollbar">
        {items.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative py-2.5 px-4 text-xs font-semibold transition-all whitespace-nowrap outline-none cursor-pointer",
                isActive
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground",
                tab.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="pt-1">{activeContent}</div>
    </div>
  );
}
