"use client";

import React, { useState } from "react";
import { ServiceRenewal, BillingCycle } from "@/types/service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { renewServiceAction } from "../actions/service-actions";
import { RefreshCw, Calendar, CheckCircle2, Clock, DollarSign } from "lucide-react";

interface ServiceRenewalsManagerProps {
  serviceId: string;
  renewalDate?: string;
  billingCycle: BillingCycle;
  cost: number;
  currency: string;
  autoRenewal: boolean;
  renewals: ServiceRenewal[];
  onRenewSuccess: () => void;
}

export function ServiceRenewalsManager({
  serviceId,
  renewalDate,
  billingCycle,
  cost,
  currency,
  autoRenewal: initialAutoRenewal,
  renewals,
  onRenewSuccess,
}: ServiceRenewalsManagerProps) {
  const { toast } = useToast();
  const [autoRenewal, setAutoRenewal] = useState(initialAutoRenewal);
  const [isRenewing, setIsRenewing] = useState(false);

  const handleExecuteRenewal = async () => {
    setIsRenewing(true);
    try {
      const result = await renewServiceAction(serviceId);
      if (result.success) {
        toast.success("Asset Renewed", { description: "Renewal logged and expiration date extended." });
        onRenewSuccess();
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to execute renewal." });
    } finally {
      setIsRenewing(false);
    }
  };

  const daysUntilRenewal = renewalDate
    ? Math.ceil((new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-4">
      {/* Renewal Header Summary */}
      <Card variant="glass" className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">Next Renewal Date</span>
                {daysUntilRenewal !== null && daysUntilRenewal <= 30 && (
                  <Badge variant="warning" className="text-[10px]">
                    Expiring in {daysUntilRenewal} Days
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {renewalDate ? new Date(renewalDate).toLocaleDateString() : "No active renewal date set"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="glow"
              size="sm"
              onClick={handleExecuteRenewal}
              isLoading={isRenewing}
              className="text-xs"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Execute Manual Renewal
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-4 border-t border-border/40 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Renewal Cost</span>
            <span className="font-bold text-foreground font-mono">${cost.toFixed(2)} {currency}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Billing Frequency</span>
            <span className="font-semibold text-foreground uppercase">{billingCycle}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Auto Renewal</span>
            <span className="font-semibold text-emerald-500">{autoRenewal ? "Enabled (Auto Charge)" : "Disabled (Manual)"}</span>
          </div>
        </div>
      </Card>

      {/* Historical Renewals Log */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Renewal History ({renewals.length})</h4>
        {renewals.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No historical renewal logs recorded yet.</p>
        ) : (
          renewals.map((r) => (
            <Card key={r.id} variant="glass" className="p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">Renewal Scheduled / Processed</span>
                  <span className="text-[10px] text-muted-foreground block">
                    {new Date(r.renewalDate).toLocaleDateString()} &bull; ${r.renewalCost} {r.currency}
                  </span>
                </div>
              </div>
              <Badge variant="success" className="text-[10px]">
                {r.status}
              </Badge>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
