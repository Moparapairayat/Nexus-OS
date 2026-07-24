"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { exitImpersonationAction } from "@/features/clients/actions/impersonation-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Key, LogOut } from "lucide-react";

interface ImpersonationBannerProps {
  clientName: string;
  adminName?: string;
}

export function ImpersonationBanner({ clientName, adminName }: ImpersonationBannerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = async () => {
    setIsExiting(true);
    try {
      const res = await exitImpersonationAction();
      if (res.success) {
        toast.success("Exited Impersonation Mode", {
          description: "Returned to Admin Directory.",
        });
        router.push(res.redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Error", { description: "Failed to exit impersonation mode." });
    } finally {
      setIsExiting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white px-4 py-2 text-xs font-medium shadow-md border-b border-purple-400/30 flex flex-col sm:flex-row items-center justify-between gap-2 z-50 sticky top-0 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white shrink-0">
          <Key className="h-3 w-3" />
        </div>
        <span>
          <strong>1-Click Client Impersonation Active:</strong> Logged into Client Portal as{" "}
          <span className="font-bold underline decoration-purple-300 underline-offset-2">{clientName}</span>
          {adminName && <span className="opacity-80 text-[11px] ml-1.5">(Admin: {adminName})</span>}
        </span>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleExit}
        isLoading={isExiting}
        className="h-6 text-[11px] px-2.5 font-semibold bg-white text-purple-700 hover:bg-purple-50 shadow-xs shrink-0 gap-1"
      >
        <LogOut className="h-3 w-3" />
        Exit Impersonation & Return to Admin
      </Button>
    </div>
  );
}
