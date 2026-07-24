"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  onPayload: (payload: any) => void;
  enabled?: boolean;
}

/**
 * Custom React hook for live Supabase PostgreSQL realtime subscriptions.
 */
export function useRealtimeSubscription({
  table,
  schema = "public",
  event = "*",
  filter,
  onPayload,
  enabled = true,
}: UseRealtimeOptions) {
  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channelName = `realtime_${table}_${Math.random().toString(36).slice(2, 7)}`;

    const channelConfig: any = {
      event,
      schema,
      table,
    };
    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", channelConfig, (payload) => {
        onPayload(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, event, filter, enabled]);
}
