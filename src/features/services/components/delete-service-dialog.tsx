"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Archive, ShieldAlert } from "lucide-react";

interface Service {
  id: string;
  customName: string;
  companyName: string;
  clientName: string;
}

interface DeleteServiceDialogProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (serviceId: string) => void;
  onDelete: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
}

export function DeleteServiceDialog({
  service,
  isOpen,
  onClose,
  onDeleted,
  onDelete,
}: DeleteServiceDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expectedText = service?.customName || "";
  const isConfirmed = confirmText === expectedText;

  const handleClose = () => {
    setConfirmText("");
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!service || !isConfirmed) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await onDelete(service.id);
      if (res.success) {
        onDeleted(service.id);
        handleClose();
      } else {
        setError(res.error || "Failed to delete service.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="flex flex-col items-center text-center gap-3 mb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <Trash2 className="h-7 w-7 text-rose-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Remove Digital Asset</h2>
          <p className="text-xs text-muted-foreground mt-1">
            This will permanently remove{" "}
            <strong className="text-foreground">{service.customName}</strong> from{" "}
            <strong className="text-foreground">{service.companyName}</strong>.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-4 mb-5 space-y-2">
        <div className="flex items-center gap-2 text-rose-500">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="text-xs font-bold">This action cannot be undone</span>
        </div>
        <ul className="text-[11px] text-muted-foreground space-y-1 pl-6 list-disc text-left">
          <li>Service record will be <strong>soft-deleted</strong> and marked as archived</li>
          <li>All credentials, files, and renewal schedules will be <strong>hidden</strong></li>
          <li>Client portal access to this asset will be <strong>revoked immediately</strong></li>
          <li>Activity history will be preserved for <strong>audit compliance</strong></li>
        </ul>
      </div>

      <div className="space-y-2 mb-5">
        <label className="text-xs font-semibold text-foreground">
          Type <span className="font-mono bg-muted px-1 py-0.5 rounded text-rose-500">{expectedText}</span> to confirm deletion:
        </label>
        <Input
          id="confirm-delete-service"
          placeholder={`Type "${expectedText}" here`}
          value={confirmText}
          onChange={(e) => {
            setConfirmText(e.target.value);
            setError(null);
          }}
          className={`text-xs ${isConfirmed ? "border-rose-500/60 focus-visible:ring-rose-500/40" : ""}`}
          autoFocus
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 mb-4">
          <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-xs text-destructive">{error}</span>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={handleClose} className="text-xs" disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="text-xs bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
          onClick={handleDelete}
          isLoading={isDeleting}
          disabled={!isConfirmed || isDeleting}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Delete Permanently
        </Button>
      </div>
    </Dialog>
  );
}
