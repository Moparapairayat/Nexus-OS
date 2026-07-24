"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getClientServicesAction } from "@/features/services/actions/service-actions";
import { getInvoicesAction } from "@/features/billing/actions/billing-actions";
import { getPaymentsAction } from "@/features/billing/actions/payment-actions";
import { getSupportTicketsAction } from "@/features/support/actions/support-actions";
import {
  Search,
  Package,
  FileText,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: "service" | "invoice" | "payment" | "ticket";
  url: string;
  badge?: string;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const q = query.toLowerCase().trim();
      const items: SearchResultItem[] = [];

      try {
        const [srvRes, invRes, payRes, tktRes] = await Promise.all([
          getClientServicesAction(),
          getInvoicesAction(),
          getPaymentsAction(),
          getSupportTicketsAction(),
        ]);

        if (srvRes.success && srvRes.data) {
          srvRes.data.services
            .filter(
              (s) =>
                s.customName.toLowerCase().includes(q) ||
                s.categoryName.toLowerCase().includes(q) ||
                (s.domainName && s.domainName.toLowerCase().includes(q))
            )
            .forEach((s) => {
              items.push({
                id: `srv-${s.id}`,
                title: s.customName,
                subtitle: `${s.categoryName} • ${s.domainName || s.serviceStatus}`,
                type: "service",
                url: "/client/services",
                badge: s.serviceStatus,
              });
            });
        }

        if (invRes.success && invRes.data) {
          invRes.data.invoices
            .filter(
              (inv) =>
                inv.invoiceNumber.toLowerCase().includes(q) ||
                inv.grandTotal.toString().includes(q)
            )
            .forEach((inv) => {
              items.push({
                id: `inv-${inv.id}`,
                title: inv.invoiceNumber,
                subtitle: `$${inv.grandTotal.toFixed(2)} ${inv.currency} • Due ${new Date(inv.dueDate).toLocaleDateString()}`,
                type: "invoice",
                url: `/client/invoices/${inv.id}`,
                badge: inv.invoiceStatus,
              });
            });
        }

        if (payRes.success && payRes.data) {
          payRes.data.payments
            .filter(
              (p) =>
                p.paymentNumber.toLowerCase().includes(q) ||
                (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q))
            )
            .forEach((p) => {
              items.push({
                id: `pay-${p.id}`,
                title: p.paymentNumber,
                subtitle: `$${p.amount.toFixed(2)} ${p.currency} • ${p.method}`,
                type: "payment",
                url: "/client/payments",
                badge: p.status,
              });
            });
        }

        if (tktRes.success && tktRes.data) {
          tktRes.data.tickets
            .filter(
              (t) =>
                t.ticketNumber.toLowerCase().includes(q) ||
                t.subject.toLowerCase().includes(q)
            )
            .forEach((t) => {
              items.push({
                id: `tkt-${t.id}`,
                title: t.subject,
                subtitle: `${t.ticketNumber} • ${t.category}`,
                type: "ticket",
                url: "/client/support",
                badge: t.status,
              });
            });
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setResults(items);
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "service":
        return <Package className="h-4 w-4 text-emerald-500" />;
      case "invoice":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      case "ticket":
        return <MessageSquare className="h-4 w-4 text-amber-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Global Search" description="Find services, invoices, payments, and tickets instantly (Ctrl + K)">
      <div className="space-y-4 pt-2 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Type to search (e.g. Domain, INV-2026, bKash)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-10 text-xs"
            autoFocus
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : query.length > 1 && results.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No matching items found for "{query}".
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1">
            {results.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.url)}
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/60 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{item.title}</span>
                    <span className="text-[11px] text-muted-foreground">{item.subtitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-muted text-muted-foreground capitalize">
                      {item.badge}
                    </span>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
