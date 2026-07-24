"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl border border-border/80 bg-card/40 glass-panel text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto border border-primary/20">
          <SearchX className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">404</h1>
        <h2 className="text-base font-bold text-foreground">Resource / Route Not Found</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The requested URL path does not exist on NexusOS or may have been relocated.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="glow" size="sm" className="text-xs gap-1.5">
              <Home className="h-3.5 w-3.5" /> Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
