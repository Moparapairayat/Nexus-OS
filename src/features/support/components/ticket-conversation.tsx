"use client";

import React from "react";
import { TicketReply } from "@/types/support";
import { ShieldAlert, User, CheckCircle2, FileText, Paperclip } from "lucide-react";

interface TicketConversationProps {
  replies: TicketReply[];
  isStaffView?: boolean;
}

export function TicketConversation({ replies, isStaffView = false }: TicketConversationProps) {
  if (!replies || replies.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl bg-muted/10">
        No conversation messages yet. Post a reply below to start the thread.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {replies.map((reply) => {
        const isAdmin = reply.authorRole === "admin" || reply.authorRole === "team_member";
        const isInternal = reply.isInternal;

        if (isInternal && !isStaffView) return null;

        return (
          <div
            key={reply.id}
            className={`p-4 rounded-2xl border transition-all ${
              isInternal
                ? "border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/5 text-amber-950 dark:text-amber-100"
                : isAdmin
                ? "border-primary/30 bg-primary/5 text-foreground"
                : "border-border/80 bg-muted/20 text-foreground"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/40 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs shrink-0 ${
                    isInternal
                      ? "bg-amber-500 text-white"
                      : isAdmin
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/20 text-foreground"
                  }`}
                >
                  {reply.authorName[0]?.toUpperCase() || "U"}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">{reply.authorName}</span>
                    {isInternal ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Staff Internal Note
                      </span>
                    ) : isAdmin ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary">
                        Support Agent
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                        Client
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-muted-foreground font-mono">
                {new Date(reply.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Content */}
            <div className="text-xs leading-relaxed whitespace-pre-wrap">{reply.content}</div>

            {/* Attachments */}
            {reply.attachments && reply.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-border/40">
                {reply.attachments.map((att, idx) => (
                  <a
                    key={att.id || idx}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/60 bg-background text-[11px] font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span>{att.name}</span>
                    <span className="text-muted-foreground text-[10px]">({att.size})</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
