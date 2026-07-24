import React from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps overflow tables so they scroll horizontally on small screens
 * without breaking the overall layout.
 */
export function TableScrollWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-x-auto -mx-0 rounded-xl", className)}>
      <div className="min-w-[600px]">{children}</div>
    </div>
  );
}
