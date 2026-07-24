"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface MenuItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  side?: "top" | "bottom" | "auto";
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = "right",
  side = "auto",
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{
    top: number;
    left: number;
    position: "top" | "bottom";
  }>({ top: 0, left: 0, position: "bottom" });

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const estimatedMenuHeight = Math.min(items.length * 40 + 20, 320);

      let isTop = false;
      if (side === "top") {
        isTop = true;
      } else if (side === "bottom") {
        isTop = false;
      } else {
        // Auto-detect based on available viewport space
        if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
          isTop = true;
        } else {
          isTop = false;
        }
      }

      setMenuCoords({
        left: align === "right" ? rect.right : rect.left,
        top: isTop ? rect.top - 6 : rect.bottom + 6,
        position: isTop ? "top" : "bottom",
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  const transformStyle =
    menuCoords.position === "top"
      ? align === "right"
        ? "translate(-100%, -100%)"
        : "translate(0, -100%)"
      : align === "right"
      ? "translate(-100%, 0)"
      : "none";

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen &&
        mounted &&
        createPortal(
          <div
            ref={menuRef}
            className={cn(
              "fixed z-[99999] min-w-[210px] max-h-[340px] overflow-y-auto rounded-xl border border-border/80 bg-card/98 text-foreground shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 space-y-0.5 backdrop-blur-2xl",
              className
            )}
            style={{
              left: `${menuCoords.left}px`,
              top: `${menuCoords.top}px`,
              transform: transformStyle,
            }}
          >
            {items.map((item) => {
              if (item.separator) {
                return <div key={item.id} className="my-1 border-t border-border/60" />;
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer select-none",
                    item.destructive
                      ? "text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                      : "text-foreground hover:bg-primary/10 hover:text-primary",
                    item.disabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
