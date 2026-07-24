"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Boxes, ShieldCheck, ArrowRight, Server, Cpu } from "lucide-react";

interface Step1WelcomeProps {
  onNext: () => void;
}

export function Step1Welcome({ onNext }: Step1WelcomeProps) {
  return (
    <Card variant="glass" className="p-6 space-y-6">
      <CardHeader className="p-0 space-y-3 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25">
          <Boxes className="h-8 w-8" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome to NexusOS Setup Wizard</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Enterprise Digital Client Portal & Business Operating System &bull; Version 1.0.0-enterprise
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4 text-xs text-muted-foreground leading-relaxed">
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
          <span className="font-bold text-foreground text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Private Self-Hosted Enterprise Environment
          </span>
          <p>
            You are initializing NexusOS for your organization. This installation wizard will guide you through system diagnostics, company branding, Super Administrator setup, email, and UddoktaPay credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-foreground font-medium">
          <div className="p-3 rounded-xl border border-border/60 bg-card/60 flex items-center gap-2.5">
            <Server className="h-4 w-4 text-primary shrink-0" />
            <div>
              <span className="block text-[10px] text-muted-foreground">Framework</span>
              <span className="text-xs">Next.js 16 App Router</span>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-border/60 bg-card/60 flex items-center gap-2.5">
            <Cpu className="h-4 w-4 text-emerald-500 shrink-0" />
            <div>
              <span className="block text-[10px] text-muted-foreground">Database</span>
              <span className="text-xs">Supabase PostgreSQL</span>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-border/60 bg-card/60 flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
            <div>
              <span className="block text-[10px] text-muted-foreground">Security</span>
              <span className="text-xs">RLS & Role Security</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/60 flex justify-end">
          <Button variant="glow" size="sm" onClick={onNext} className="text-xs px-6">
            Begin Installation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
