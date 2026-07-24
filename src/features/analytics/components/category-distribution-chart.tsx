"use client";

import React from "react";
import { CategoryDistribution } from "@/types/analytics";

interface CategoryDistributionChartProps {
  data: CategoryDistribution[];
}

const COLORS = [
  "bg-blue-500 text-blue-500",
  "bg-emerald-500 text-emerald-500",
  "bg-amber-500 text-amber-500",
  "bg-purple-500 text-purple-500",
  "bg-indigo-500 text-indigo-500",
];

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
        No service category distribution data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Multi-Bar */}
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted/40 p-0.5 border border-border/50">
        {data.map((cat, idx) => (
          <div
            key={cat.category || idx}
            style={{ width: `${Math.max(cat.percentage, 5)}%` }}
            className={`h-full first:rounded-l-full last:rounded-r-full transition-all ${
              COLORS[idx % COLORS.length].split(" ")[0]
            }`}
            title={`${cat.category}: ${cat.percentage}%`}
          />
        ))}
      </div>

      {/* Breakdown List */}
      <div className="space-y-2.5">
        {data.map((cat, idx) => (
          <div key={cat.category || idx} className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-muted/20 text-xs">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${COLORS[idx % COLORS.length].split(" ")[0]}`} />
              <span className="font-semibold text-foreground">{cat.category}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">{cat.count} Active</span>
              <span className="font-mono font-bold text-foreground">${cat.revenue.toFixed(2)}</span>
              <span className="font-bold text-primary text-[11px] w-10 text-right">{cat.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
