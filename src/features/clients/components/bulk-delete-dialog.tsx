"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Client } from "@/types/client";
import { AlertTriangle, Trash2, Archive, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

interface BulkDeleteDialogProps {
  clients: Client[];
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (clientIds: string[]) => void;
  onArchived: (clientIds: string[]) => void;
  onBulkDelete: (ids: string[]) => Promise<{ success: boolean; data?: { successCount: number; failCount: number }; error?: string }>;
  onBulkArchive: (ids: string[]) => Promise<{ success: boolean; data?: { successCount: number }; error?: string }>;
}

export function BulkDeleteDialog({
  clients,
  isOpen,
  onClose,
  onDeleted,
  onArchived,
  onBulkDelete,
  onBulkArchive,
}: BulkDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ successCount: number; failCount: number } | null>(null);

  const ids = clients.map((c) => c.id);

  const handleClose = () => {
    setError(null);
    setResult(null);
    onClose();
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await onBulkDelete(ids);
      if (res.success && res.data) {
        setResult({ successCount: res.data.successCount, failCount: res.data.failCount });
        onDeleted(ids);
        setTimeout(handleClose, 1800);
      } else {
        setError(res.error || "Bulk delete failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkArchive = async () => {
    setIsArchiving(true);
    setError(null);
    try {
      const res = await onBulkArchive(ids);
      if (res.success) {
        onArchived(ids);
        handleClose();
      } else {
        setError(res.error || "Bulk archive failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 mb-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <Trash2 className="h-7 w-7 text-rose-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Remove {clients.length} Client{clients.length > 1 ? "s" : ""}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            You are about to permanently delete <strong>{clients.length}</strong> selected client accounts.
          </p>
        </div>
      </div>

      {/* Selected Clients Preview */}
      <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden mb-4">
        <div className="px-3 py-2 bg-muted/40 border-b border-border/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Selected Clients ({clients.length})
          </span>
        </div>
        <div className="max-h-36 overflow-y-auto divide-y divide-border/30">
          {clients.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-foreground">{c.companyName}</p>
                <p className="text-[10px] text-muted-foreground">{c.email}</p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{c.clientStatus}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
          <ul className="text-[11px] text-muted-foreground space-y-0.5 list-disc pl-1">
            <li>All data, contacts, notes, and files will be <strong>permanently removed</strong></li>
            <li>Portal access will be <strong>immediately revoked</strong> for all selected clients</li>
            <li><strong>This action cannot be undone</strong></li>
          </ul>
        </div>
      </div>

      {/* Archive Alternative */}
      <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 mb-5 flex items-start gap-3">
        <Archive className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-foreground">Archive Instead?</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Preserve data but revoke portal access for all selected clients.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 h-7 text-[11px] border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
            onClick={handleBulkArchive}
            isLoading={isArchiving}
          >
            <Archive className="mr-1.5 h-3 w-3" />
            Archive {clients.length} Client{clients.length > 1 ? "s" : ""}
          </Button>
        </div>
      </div>

      {/* Result feedback */}
      {result && (
        <div className={`flex items-center gap-2 rounded-xl p-3 mb-4 text-xs ${result.failCount === 0 ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border border-amber-500/20 text-amber-500"}`}>
          {result.failCount === 0 ? (
            <><CheckCircle2 className="h-4 w-4 shrink-0" /> {result.successCount} client{result.successCount > 1 ? "s" : ""} permanently deleted.</>
          ) : (
            <><XCircle className="h-4 w-4 shrink-0" /> {result.successCount} deleted, {result.failCount} failed.</>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 mb-4">
          <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-xs text-destructive">{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={handleClose} disabled={isDeleting} className="text-xs">
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
          onClick={handleBulkDelete}
          isLoading={isDeleting}
          disabled={isDeleting || isArchiving}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Delete All {clients.length} Permanently
        </Button>
      </div>
    </Dialog>
  );
}
