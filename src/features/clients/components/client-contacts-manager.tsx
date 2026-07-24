"use client";

import React, { useState } from "react";
import { ClientContact, ContactRole } from "@/types/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addContactAction } from "../actions/client-actions";
import { User, Mail, Phone, Plus, Star } from "lucide-react";

interface ClientContactsManagerProps {
  clientId: string;
  contacts: ClientContact[];
}

export function ClientContactsManager({ clientId, contacts: initialContacts }: ClientContactsManagerProps) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ClientContact[]>(initialContacts);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ContactRole>("technical");
  const [phone, setPhone] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await addContactAction(clientId, {
        name,
        email,
        role,
        phone,
        isPrimary,
      });

      if (result.success && result.data) {
        setContacts((prev) => [...prev, result.data as ClientContact]);
        toast.success("Contact Added", { description: `${name} registered as ${role} contact.` });
        setName("");
        setEmail("");
        setPhone("");
        setIsAdding(false);
      }
    } catch (err: any) {
      toast.error("Error", err?.message || "Failed to add contact.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight">Organization Contacts</h3>
          <p className="text-xs text-muted-foreground">Manage multi-department contacts (Owner, Billing, Technical, Support).</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)} className="text-xs">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {isAdding ? "Cancel" : "Add Contact"}
        </Button>
      </div>

      {isAdding && (
        <Card variant="glass" className="p-4 border-primary/30 animate-in fade-in">
          <form onSubmit={handleAddContact} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField>
                <FormLabel>Contact Name *</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Rivera" required />
              </FormField>
              <FormField>
                <FormLabel>Role *</FormLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value as ContactRole)}
                  options={[
                    { value: "owner", label: "Owner / Primary" },
                    { value: "billing", label: "Billing & Finance" },
                    { value: "technical", label: "Technical Lead" },
                    { value: "support", label: "Support Contact" },
                    { value: "custom", label: "Custom Contact" },
                  ]}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField>
                <FormLabel>Email *</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@company.com" required />
              </FormField>
              <FormField>
                <FormLabel>Phone</FormLabel>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </FormField>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="primaryContact"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-input text-primary"
              />
              <label htmlFor="primaryContact" className="text-xs text-muted-foreground select-none">
                Mark as primary organization contact
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" variant="glow" size="sm" isLoading={isLoading}>
                Save Contact
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {contacts.map((contact) => (
          <Card key={contact.id} variant="glass" className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">{contact.name}</span>
                    {contact.isPrimary && (
                      <Badge variant="glow" className="text-[9px] px-1.5 py-0">
                        <Star className="mr-0.5 h-2.5 w-2.5 inline fill-current" /> Primary
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{contact.role}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-xs text-muted-foreground border-t border-border/40 pt-2">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>{contact.phone}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
