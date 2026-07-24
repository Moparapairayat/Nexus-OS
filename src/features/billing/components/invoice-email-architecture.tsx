"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Bell, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceEmailArchitectureProps {
  invoiceNumber: string;
  clientEmail: string;
  amount: string;
}

export function InvoiceEmailArchitecture({
  invoiceNumber,
  clientEmail,
  amount,
}: InvoiceEmailArchitectureProps) {
  const { toast } = useToast();
  const [activeTemplate, setActiveTemplate] = useState<"invoice" | "reminder" | "receipt">("invoice");

  const handleSimulateEmail = (type: string) => {
    toast.success("Email Dispatch Prepared", {
      description: `${type} notification template generated for ${clientEmail} via Resend.`,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold tracking-tight">Email Dispatch Architecture & Prepared Templates</h3>
        <p className="text-xs text-muted-foreground">
          Prepared email templates for invoice delivery, payment reminders, and digital receipts.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <Button
          variant={activeTemplate === "invoice" ? "glow" : "ghost"}
          size="sm"
          onClick={() => setActiveTemplate("invoice")}
          className="text-xs"
        >
          <Mail className="mr-1.5 h-3.5 w-3.5" /> Invoice Delivery
        </Button>
        <Button
          variant={activeTemplate === "reminder" ? "glow" : "ghost"}
          size="sm"
          onClick={() => setActiveTemplate("reminder")}
          className="text-xs"
        >
          <Bell className="mr-1.5 h-3.5 w-3.5" /> Payment Reminder
        </Button>
        <Button
          variant={activeTemplate === "receipt" ? "glow" : "ghost"}
          size="sm"
          onClick={() => setActiveTemplate("receipt")}
          className="text-xs"
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Payment Receipt
        </Button>
      </div>

      <Card variant="glass" className="p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Template Preview & Context</span>
          <Badge variant="outline" className="text-[10px]">
            To: {clientEmail}
          </Badge>
        </div>

        {activeTemplate === "invoice" && (
          <div className="space-y-2 bg-muted/40 p-3 rounded-xl border border-border/40 font-mono text-[11px]">
            <p><span className="text-muted-foreground">Subject:</span> New Invoice {invoiceNumber} from NexusOS</p>
            <p className="text-foreground pt-1">Hello, your invoice {invoiceNumber} for total {amount} is ready for review.</p>
          </div>
        )}

        {activeTemplate === "reminder" && (
          <div className="space-y-2 bg-muted/40 p-3 rounded-xl border border-border/40 font-mono text-[11px]">
            <p><span className="text-muted-foreground">Subject:</span> Reminder: Invoice {invoiceNumber} Payment Due</p>
            <p className="text-foreground pt-1">Hello, friendly reminder that payment of {amount} for invoice {invoiceNumber} is due soon.</p>
          </div>
        )}

        {activeTemplate === "receipt" && (
          <div className="space-y-2 bg-muted/40 p-3 rounded-xl border border-border/40 font-mono text-[11px]">
            <p><span className="text-muted-foreground">Subject:</span> Payment Received: Receipt for Invoice {invoiceNumber}</p>
            <p className="text-foreground pt-1">Thank you! Payment of {amount} for invoice {invoiceNumber} has been received.</p>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSimulateEmail(activeTemplate.toUpperCase())}
            className="text-xs"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" /> Prepare & Queue Email
          </Button>
        </div>
      </Card>
    </div>
  );
}
