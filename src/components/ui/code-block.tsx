"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { Button } from "./button";

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "typescript", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={cn("relative rounded-xl border border-border/60 bg-muted/40 overflow-hidden font-mono text-xs", className)}>
      <div className="flex items-center justify-between border-b border-border/40 px-3.5 py-1.5 bg-muted/60">
        <span className="text-[11px] font-medium text-muted-foreground uppercase">{language}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="mr-1 h-3 w-3 text-emerald-500" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3 w-3" /> Copy
            </>
          )}
        </Button>
      </div>
      <div className="p-3.5 overflow-x-auto text-foreground/90 leading-relaxed">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
