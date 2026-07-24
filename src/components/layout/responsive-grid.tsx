import React from "react";
import { cn } from "@/lib/utils";

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6;
}

export function ResponsiveGrid({
  cols = 3,
  className,
  children,
  ...props
}: ResponsiveGridProps) {
  const gridColsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
  };

  return (
    <div className={cn("grid gap-3 sm:gap-4 md:gap-6", gridColsMap[cols], className)} {...props}>
      {children}
    </div>
  );
}
