"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { finalizeInstallationAction } from "../actions/setup-actions";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

interface Step8FinalizeProps {
  setupPayload: any;
  onPrev: () => void;
}

export function Step8Finalize({ setupPayload, onPrev }: Step8FinalizeProps) {
  const { toast } = useToast();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      const res = await finalizeInstallationAction(setupPayload);
      if (res.success) {
        setIsComplete(true);
        toast.success("Installation Complete!", {
          description: "NexusOS has been initialized successfully.",
        });
      }
    } catch (err: any) {
      toast.error("Error", { description: "Finalization error." });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <CardHeader className="p-0 space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/25">
          {isComplete ? <CheckCircle2 className="h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
        </div>
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isComplete ? "Installation Complete & System Ready!" : "Finalize Enterprise Setup"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {isComplete
              ? "NexusOS is fully configured. The setup wizard is now permanently locked."
              : "Review installation parameters and seed the database with initial settings."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5">
          <span className="font-bold text-foreground text-xs uppercase tracking-wider block">Installation Summary</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
            <div>
              <span>Company:</span> <strong className="text-foreground">{setupPayload.company?.name}</strong>
            </div>
            <div>
              <span>Super Admin:</span> <strong className="text-foreground">{setupPayload.superAdmin?.email}</strong>
            </div>
            <div>
              <span>Resend Email:</span> <strong className="text-emerald-500">Configured</strong>
            </div>
          </div>
        </div>

        {isComplete ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <span className="font-bold text-emerald-500 text-sm block">System Initialized Successfully</span>
            <p className="text-muted-foreground text-xs">
              All settings stored securely. Click below to proceed to the Administrator Login.
            </p>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 px-4 py-2.5 text-xs font-semibold transition-all mt-2"
            >
              Go to Administrator Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <Button type="button" variant="outline" size="sm" onClick={onPrev} disabled={isFinalizing} className="text-xs">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
            </Button>

            <Button variant="glow" size="sm" onClick={handleFinalize} isLoading={isFinalizing} className="text-xs px-6">
              Finalize & Seed System <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
