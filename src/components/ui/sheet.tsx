"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  side = "right",
  children,
  className,
}: SheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const sideStyles = {
    right: "right-0 h-full w-full max-w-md animate-in slide-in-from-right duration-250",
    left: "left-0 h-full w-full max-w-md animate-in slide-in-from-left duration-250",
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet Content Panel */}
      <div
        className={cn(
          "relative z-[10000] flex flex-col bg-card/95 text-foreground shadow-2xl border-l border-border/80 glass-panel p-6 overflow-y-auto",
          sideStyles[side],
          className
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            {title && <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-lg">
            <X className="h-4 w-4" />
            <span className="sr-only">Close sheet</span>
          </Button>
        </div>

        <div className="flex-1 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
