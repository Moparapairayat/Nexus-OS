"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, KeyRound, Clock, Mail } from "lucide-react";

interface InvitationLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationUrl: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
}

export function InvitationLinkModal({
  isOpen,
  onClose,
  invitationUrl,
  clientName,
  clientEmail,
  companyName,
}: InvitationLinkModalProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${invitationUrl}`
    : invitationUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = fullUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Invitation Link Ready</h2>
          <p className="text-xs text-muted-foreground">Share this link with the client to activate their portal account.</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="rounded-xl bg-muted/40 border border-border/50 p-4 mb-4 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
          <div>
            <span className="font-semibold text-foreground">{clientName}</span>
            <span className="text-muted-foreground"> · {companyName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0 opacity-0" />
          <span>{clientEmail}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-500">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>This link expires in <strong>7 days</strong>. Share it promptly.</span>
        </div>
      </div>

      {/* Link Display + Copy */}
      <div className="space-y-2 mb-5">
        <label className="text-xs font-semibold text-foreground">Invitation Link</label>
        <div className="flex gap-2">
          <div className="flex-1 min-w-0 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-[11px] font-mono text-muted-foreground truncate select-all cursor-text">
            {fullUrl}
          </div>
          <Button
            variant={copied ? "secondary" : "glow"}
            size="sm"
            onClick={handleCopy}
            className="shrink-0 text-xs px-4 transition-all"
          >
            {copied ? (
              <><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> Copied!</>
            ) : (
              <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Link</>
            )}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          You can also click inside the URL box to select all, then copy manually.
        </p>
      </div>

      {/* Open in new tab */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <a
          href={fullUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Preview Link
        </a>
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
          Done
        </Button>
      </div>
    </Dialog>
  );
}
