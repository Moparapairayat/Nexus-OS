import React from "react";
import { cn } from "@/lib/utils";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center font-mono text-[10px] font-medium text-muted-foreground bg-muted/80 border border-border/80 px-1.5 py-0.5 rounded shadow-xs select-none",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
