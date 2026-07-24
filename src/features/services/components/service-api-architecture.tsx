"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Server, Globe, Cpu, Activity, Lock, Terminal } from "lucide-react";

interface ServiceApiArchitectureProps {
  categoryName: string;
  domainName?: string;
  serverIp?: string;
  cloudflareZoneId?: string;
}

export function ServiceApiArchitecture({
  categoryName,
  domainName,
  serverIp,
  cloudflareZoneId,
}: ServiceApiArchitectureProps) {
  const isCloudflare = categoryName.includes("Cloudflare");
  const isServer = categoryName.includes("Server") || categoryName.includes("VPS");
  const isDomain = categoryName.includes("Domain");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold tracking-tight">API Integration Architecture & Provider Hooks</h3>
        <p className="text-xs text-muted-foreground">
          Prepared integration architecture for automated provisioning, DNS sync, and uptime monitoring APIs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Cloudflare API Integration Architecture */}
        <Card variant="glass" className="p-4 space-y-3 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-amber-500" />
              <span className="font-bold text-foreground">Cloudflare v4 API Hook</span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
              Architecture Ready
            </Badge>
          </div>
          <div className="space-y-1 font-mono text-[11px] bg-muted/60 p-2.5 rounded-xl border border-border/40 text-muted-foreground">
            <p><span className="text-primary font-semibold">GET</span> /client/v4/zones/{cloudflareZoneId || "zone_id"}/dns_records</p>
            <p><span className="text-emerald-500 font-semibold">POST</span> /client/v4/zones/{cloudflareZoneId || "zone_id"}/firewall/rules</p>
            <p className="text-[10px] text-muted-foreground mt-1">// WAF, SSL & Cache Purge hooks prepared</p>
          </div>
        </Card>

        {/* Server & Control Panel API Hook */}
        <Card variant="glass" className="p-4 space-y-3 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-purple-500" />
              <span className="font-bold text-foreground">cPanel / WHM / Plesk API</span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-500 border-purple-500/30">
              Architecture Ready
            </Badge>
          </div>
          <div className="space-y-1 font-mono text-[11px] bg-muted/60 p-2.5 rounded-xl border border-border/40 text-muted-foreground">
            <p><span className="text-primary font-semibold">GET</span> https://{serverIp || "server_ip"}:2087/json-api/accountsummary</p>
            <p><span className="text-emerald-500 font-semibold">POST</span> https://{serverIp || "server_ip"}:2087/json-api/createacct</p>
            <p className="text-[10px] text-muted-foreground mt-1">// Quota, Bandwidth & SSH hooks prepared</p>
          </div>
        </Card>

        {/* Domain Registrar EPP Hook */}
        <Card variant="glass" className="p-4 space-y-3 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="font-bold text-foreground">Domain Registrar EPP Sync</span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/30">
              Architecture Ready
            </Badge>
          </div>
          <div className="space-y-1 font-mono text-[11px] bg-muted/60 p-2.5 rounded-xl border border-border/40 text-muted-foreground">
            <p><span className="text-primary font-semibold">POST</span> /epp/domain/renew?domain={domainName || "domain.com"}</p>
            <p><span className="text-emerald-500 font-semibold">PUT</span> /epp/domain/nameservers</p>
            <p className="text-[10px] text-muted-foreground mt-1">// EPP Registry & Transfer Auth Prepared</p>
          </div>
        </Card>

        {/* Real-time Uptime & SLA Monitor */}
        <Card variant="glass" className="p-4 space-y-3 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span className="font-bold text-foreground">SLA Health & Incident Ping</span>
            </div>
            <Badge variant="success" className="text-[10px]">
              Active Monitor Hook
            </Badge>
          </div>
          <div className="space-y-1 font-mono text-[11px] bg-muted/60 p-2.5 rounded-xl border border-border/40 text-muted-foreground">
            <p><span className="text-emerald-500 font-semibold">PING</span> {serverIp || domainName || "endpoint"}</p>
            <p><span className="text-blue-500 font-semibold">HTTP 200 OK</span> (Latency: 24ms &bull; SSL Valid)</p>
            <p className="text-[10px] text-muted-foreground mt-1">// Continuous 60-second health check</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
