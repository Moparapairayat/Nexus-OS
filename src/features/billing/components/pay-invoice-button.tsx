"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createUddoktaPayCheckoutAction } from "../actions/payment-actions";
import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";

interface PayInvoiceButtonProps {
  invoiceId: string;
  amount: number;
  currency: string;
  isPaid?: boolean;
  onSuccess?: () => void;
}

export function PayInvoiceButton({
  invoiceId,
  amount,
  currency,
  isPaid = false,
}: PayInvoiceButtonProps) {
  const { toast, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (isPaid) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
        <ShieldCheck className="h-4 w-4" />
        Invoice Paid in Full
      </div>
    );
  }

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const res = await createUddoktaPayCheckoutAction(invoiceId);
      if (!res.success || !res.checkoutUrl) {
        toastError("Payment Failed", res.error || "Failed to initialize UddoktaPay checkout session.");
        setIsLoading(false);
        return;
      }

      toast.success("Redirecting to UddoktaPay", {
        description: "Opening secure checkout session...",
      });

      // Redirect client to UddoktaPay checkout
      window.location.href = res.checkoutUrl;
    } catch (err: any) {
      toastError("Error", err?.message || "An error occurred starting payment.");
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="glow"
      size="md"
      onClick={handlePayment}
      isLoading={isLoading}
      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2"
    >
      <CreditCard className="h-4 w-4" />
      Pay ${amount.toFixed(2)} with UddoktaPay
      <ExternalLink className="h-3.5 w-3.5 opacity-80" />
    </Button>
  );
}
