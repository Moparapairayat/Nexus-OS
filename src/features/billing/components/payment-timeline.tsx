"use client";

import React from "react";
import { PaymentLog } from "@/types/payment";
import { CheckCircle2, Clock, ShieldCheck, AlertCircle, FileCheck, ArrowUpRight } from "lucide-react";

interface PaymentTimelineProps {
  logs: PaymentLog[];
}

export function PaymentTimeline({ logs }: PaymentTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
        No payment timeline logs recorded yet.
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "payment_started":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "redirected":
        return <ArrowUpRight className="h-4 w-4 text-purple-500" />;
      case "webhook_received":
      case "webhook_verified":
        return <ShieldCheck className="h-4 w-4 text-indigo-500" />;
      case "invoice_paid":
      case "manual_verified":
      case "resynced":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "receipt_generated":
        return <FileCheck className="h-4 w-4 text-amber-500" />;
      case "payment_failed":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
      {logs.map((log) => (
        <div key={log.id} className="relative flex items-start gap-3">
          <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border shadow-xs">
            {getEventIcon(log.eventType)}
          </div>
          <div className="flex-1 bg-muted/20 border border-border/60 p-3 rounded-xl">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-foreground capitalize">
                {log.eventType.replace(/_/g, " ")}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{log.description}</p>
            {log.performedBy && (
              <span className="text-[10px] text-muted-foreground/70 block mt-1">
                Actor: {log.performedBy}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
