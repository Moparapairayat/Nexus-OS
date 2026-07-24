"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runSystemHealthCheckAction } from "../actions/setup-actions";
import { SystemHealthCheck } from "@/types/setup";
import { CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";

interface Step2RequirementsProps {
  onNext: () => void;
  onPrev: () => void;
}

export function Step2Requirements({ onNext, onPrev }: Step2RequirementsProps) {
  const [checks, setChecks] = useState<SystemHealthCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const executeDiagnostics = async () => {
    setIsLoading(true);
    try {
      const res = await runSystemHealthCheckAction();
      if (res.success) setChecks(res.checks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeDiagnostics();
  }, []);

  const allPassed = checks.every((c) => c.status === "passed" || c.status === "warning");

  return (
    <Card variant="glass" className="p-6 space-y-5">
      <CardHeader className="p-0 space-y-1">
        <CardTitle className="text-xl">System Requirements & Health Diagnostics</CardTitle>
        <CardDescription className="text-xs">
          Verifying database connectivity, authentication server, storage buckets, and runtime environment.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground">Running System Diagnostics...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {checks.map((chk) => (
              <div key={chk.id} className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground block">{chk.name}</span>
                    <span className="text-[11px] text-muted-foreground">{chk.message}</span>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px] uppercase">
                  {chk.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-border/60 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onPrev} className="text-xs">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={executeDiagnostics} className="text-xs">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Re-run Checks
            </Button>
            <Button variant="glow" size="sm" onClick={onNext} disabled={!allPassed || isLoading} className="text-xs px-6">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
