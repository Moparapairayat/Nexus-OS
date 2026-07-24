"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client } from "@/types/client";
import { AlertTriangle, Trash2, Archive, ShieldAlert } from "lucide-react";

interface DeleteClientDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (clientId: string) => void;
  onArchived?: (clientId: string) => void;
  onDelete: (clientId: string) => Promise<{ success: boolean; error?: string }>;
  onArchive?: (clientId: string) => Promise<{ success: boolean; error?: string }>;
}

export function DeleteClientDialog({
  client,
  isOpen,
  onClose,
  onDeleted,
  onArchived,
  onDelete,
  onArchive,
}: DeleteClientDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expectedText = client?.companyName || "";
  const isConfirmed = confirmText === expectedText;

  const handleClose = () => {
    setConfirmText("");
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!client || !isConfirmed) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await onDelete(client.id);
      if (res.success) {
        onDeleted(client.id);
        handleClose();
      } else {
        setError(res.error || "Failed to delete client.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (!client || !onArchive) return;
    setIsArchiving(true);
    setError(null);
    try {
      const res = await onArchive(client.id);
      if (res.success) {
        onArchived?.(client.id);
        handleClose();
      } else {
        setError(res.error || "Failed to archive client.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsArchiving(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-md"
    >
      {/* Danger Header */}
      <div className="flex flex-col items-center text-center gap-3 mb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <Trash2 className="h-7 w-7 text-rose-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Remove Client Account</h2>
          <p className="text-xs text-muted-foreground mt-1">
            This will permanently delete all records for{" "}
            <strong className="text-foreground">{client.companyName}</strong>.
          </p>
        </div>
      </div>

      {/* Warning box */}
      <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-4 mb-5 space-y-2">
        <div className="flex items-center gap-2 text-rose-500">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="text-xs font-bold">This action cannot be undone</span>
        </div>
        <ul className="text-[11px] text-muted-foreground space-y-1 pl-6 list-disc">
          <li>Client profile and all associated data will be <strong>permanently deleted</strong></li>
          <li>Portal access will be <strong>immediately revoked</strong> from Supabase Auth</li>
          <li>All contacts, notes, files, and activity logs will be <strong>removed</strong></li>
          <li>Any active invoices or services linked to this client may be <strong>orphaned</strong></li>
        </ul>
      </div>

      {/* Archive Alternative */}
      {onArchive && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 mb-5">
          <div className="flex items-start gap-3">
            <Archive className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">Consider Archiving Instead</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Archive preserves all data and revokes portal access safely. The record can be restored later.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-7 text-[11px] border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                onClick={handleArchive}
                isLoading={isArchiving}
              >
                <Archive className="mr-1.5 h-3 w-3" />
                Archive Client Instead
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Text Input */}
      <div className="space-y-2 mb-5">
        <label className="text-xs font-semibold text-foreground">
          Type <span className="font-mono bg-muted px-1 py-0.5 rounded text-rose-500">{expectedText}</span> to confirm permanent deletion:
        </label>
        <Input
          id="confirm-delete-input"
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

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 mb-4">
          <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-xs text-destructive">{error}</span>
        </div>
      )}

      {/* Actions */}
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
