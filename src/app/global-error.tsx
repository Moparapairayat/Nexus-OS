"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-rose-500/30 bg-rose-500/5 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mx-auto">
            <AlertOctagon className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">Runtime Exception Caught</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            NexusOS encountered an unhandled system exception. Our operational logging engine has recorded this event.
          </p>

          {error.digest && (
            <span className="text-[10px] font-mono px-3 py-1 rounded bg-muted text-muted-foreground block">
              Digest Code: {error.digest}
            </span>
          )}

          <div className="pt-2 flex justify-center">
            <Button variant="glow" size="sm" onClick={() => reset()} className="gap-1.5 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Reload Platform
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
