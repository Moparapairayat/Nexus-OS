import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  className?: string;
  children?: React.ReactNode;
}

export function LoadingOverlay({
  isLoading,
  text = "Loading...",
  className,
  children,
}: LoadingOverlayProps) {
  return (
    <div className="relative w-full">
      {children}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200",
            className
          )}
        >
          <Spinner size="lg" />
          {text && <span className="text-xs font-medium text-muted-foreground">{text}</span>}
        </div>
      )}
    </div>
  );
}
