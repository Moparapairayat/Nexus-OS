"use client";

import React from "react";
import { RevenueTrendPoint } from "@/types/analytics";

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
        No revenue trend data available.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.collections)), 100);

  return (
    <div className="space-y-4">
      {/* Chart Legend */}
      <div className="flex items-center justify-end gap-4 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-foreground">Revenue Billed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-foreground">Collections Settled</span>
        </div>
      </div>

      {/* Bar Visualization */}
      <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-border/60 px-2">
        {data.map((pt, idx) => {
          const revHeightPercent = Math.round((pt.revenue / maxVal) * 100);
          const colHeightPercent = Math.round((pt.collections / maxVal) * 100);

          return (
            <div key={pt.period || idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1.5 h-full">
                {/* Revenue Bar */}
                <div
                  className="w-1/2 max-w-[24px] bg-gradient-to-t from-primary/80 to-primary rounded-t-lg transition-all group-hover:brightness-125 relative"
                  style={{ height: `${Math.max(revHeightPercent, 10)}%` }}
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-foreground transition-opacity z-10 whitespace-nowrap shadow-md">
                    ${pt.revenue}
                  </span>
                </div>

                {/* Collections Bar */}
                <div
                  className="w-1/2 max-w-[24px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all group-hover:brightness-125 relative"
                  style={{ height: `${Math.max(colHeightPercent, 10)}%` }}
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 transition-opacity z-10 whitespace-nowrap shadow-md">
                    ${pt.collections}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground mt-2">{pt.period}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
