import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  subtitle,
  icon,
  className,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColors = {
    up: "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20",
    down: "text-destructive bg-destructive/10 border border-destructive/20",
    neutral: "text-muted-foreground bg-muted/60 border border-border/60",
  };

  return (
    <Card
      variant="glass"
      className={cn(
        "relative overflow-hidden p-3 sm:p-4 md:p-5 flex flex-col justify-between space-y-2 sm:space-y-3 group hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300",
        className
      )}
    >
      {/* Top Accent Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {icon && (
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-purple-500/10 text-primary border border-primary/20 shadow-sm group-hover:scale-105 transition-transform duration-300">
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-lg sm:text-xl md:text-2xl md:md:text-3xl font-black tracking-tight text-foreground font-mono">
          {value}
        </div>

        {(change !== undefined || subtitle) && (
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
            {change !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold",
                  trendColors[trend]
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {change}
              </span>
            )}
            {subtitle && <span className="text-[11px] text-muted-foreground truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}
