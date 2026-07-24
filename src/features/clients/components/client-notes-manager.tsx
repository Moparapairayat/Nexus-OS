"use client";

import React, { useState } from "react";
import { ClientNote } from "@/types/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addNoteAction, togglePinNoteAction } from "../actions/client-actions";
import { Pin, Send, StickyNote, User } from "lucide-react";

interface ClientNotesManagerProps {
  clientId: string;
  notes: ClientNote[];
}

export function ClientNotesManager({ clientId, notes: initialNotes }: ClientNotesManagerProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<ClientNote[]>(initialNotes);
  const [newContent, setNewContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setIsLoading(true);

    try {
      const result = await addNoteAction(clientId, newContent, isPinned);
      if (result.success && result.data) {
        setNotes((prev) => [result.data as ClientNote, ...prev]);
        setNewContent("");
        setIsPinned(false);
        toast.success("Note Added", { description: "Private admin note saved." });
      }
    } catch (err: any) {
      toast.error("Error", { description: err?.message || "Failed to add note." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      await togglePinNoteAction(clientId, noteId);
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n))
      );
    } catch (err: any) {
      toast.error("Error", { description: "Failed to update note pin state." });
    }
  };

  const sortedNotes = [...notes].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="space-y-4">
      {/* Note Input */}
      <Card variant="glass" className="p-4">
        <form onSubmit={handleAddNote} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <StickyNote className="h-4 w-4 text-amber-500" /> Private Admin Note
            </span>
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                isPinned ? "bg-amber-500/20 text-amber-500" : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <Pin className={`h-3.5 w-3.5 ${isPinned ? "rotate-45 fill-amber-500" : ""}`} />
              {isPinned ? "Pinned Note" : "Pin Note"}
            </button>
          </div>

          <Textarea
            placeholder="Write internal notes, SLA requirements, or client preferences..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            className="text-xs"
          />

          <div className="flex justify-end">
            <Button type="submit" variant="glow" size="sm" isLoading={isLoading} className="text-xs">
              <Send className="mr-1.5 h-3.5 w-3.5" /> Save Note
            </Button>
          </div>
        </form>
      </Card>

      {/* List of Notes */}
      <div className="space-y-3">
        {sortedNotes.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No private admin notes recorded yet.</p>
        ) : (
          sortedNotes.map((note) => (
            <Card
              key={note.id}
              variant="glass"
              className={`p-4 transition-all ${note.isPinned ? "border-amber-500/40 bg-amber-500/5" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{note.createdBy}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => handleTogglePin(note.id)}
                  className="text-muted-foreground hover:text-amber-500 transition-colors p-1 cursor-pointer"
                >
                  <Pin className={`h-3.5 w-3.5 ${note.isPinned ? "rotate-45 text-amber-500 fill-amber-500" : ""}`} />
                </button>
              </div>

              <p className="mt-2 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{note.content}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
