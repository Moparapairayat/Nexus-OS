"use client";

import React from "react";
import Link from "next/link";
import { ClientService, ServiceStatus } from "@/types/service";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Globe, Server, Cloud, Calendar, DollarSign, MoreHorizontal, ExternalLink, RefreshCw, ShieldAlert } from "lucide-react";

interface ServiceGridProps {
  data: ClientService[];
  onStatusChange: (id: string, newStatus: ServiceStatus) => void;
  onRenew: (id: string) => void;
}

export function ServiceGrid({ data, onStatusChange, onRenew }: ServiceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((srv) => (
        <Card key={srv.id} variant="glass" className="hover:border-primary/40 transition-all duration-200 group">
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                {srv.categoryName.includes("Cloudflare") ? (
                  <Cloud className="h-5 w-5 text-amber-500" />
                ) : srv.categoryName.includes("Server") ? (
                  <Server className="h-5 w-5 text-purple-500" />
                ) : (
                  <Globe className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="truncate">
                <Link
                  href={`/admin/services/${srv.id}`}
                  className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate block"
                >
                  {srv.customName}
                </Link>
                <span className="text-xs text-muted-foreground truncate block">{srv.companyName}</span>
              </div>
            </div>

            <DropdownMenu
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              }
              align="right"
              items={[
                {
                  id: "view",
                  label: "View Details",
                  icon: <ExternalLink className="h-3.5 w-3.5" />,
                  onClick: () => (window.location.href = `/admin/services/${srv.id}`),
                },
                {
                  id: "renew",
                  label: "Renew Asset",
                  icon: <RefreshCw className="h-3.5 w-3.5 text-blue-500" />,
                  onClick: () => onRenew(srv.id),
                },
                {
                  id: "suspend",
                  label: "Suspend",
                  icon: <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />,
                  onClick: () => onStatusChange(srv.id, "suspended"),
                },
              ]}
            />
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between pt-1">
              <StatusBadge status={srv.serviceStatus as any} />
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                {srv.categoryName}
              </Badge>
            </div>

            <div className="space-y-1.5 text-muted-foreground pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Recurring Cost
                </span>
                <span className="font-bold text-foreground font-mono">
                  ${srv.customPrice.toFixed(2)} / {srv.billingCycle}
                </span>
              </div>

              {srv.renewalDate && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" /> Next Renewal
                  </span>
                  <span className="font-medium text-foreground">
                    {new Date(srv.renewalDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 pt-2">
              {srv.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
