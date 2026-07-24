import { z } from "zod";

export const clientFormSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters."),
  companyName: z.string().min(2, "Company name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().url("Invalid URL format.").optional().or(z.literal("")),
  industry: z.string().optional(),
  businessRegNo: z.string().optional(),
  billingAddress: z.string().optional(),
  country: z.string().min(2, "Please select a country."),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  taxNumber: z.string().optional(),
  preferredCurrency: z.string().default("USD"),
  preferredLanguage: z.string().default("en"),
  timezone: z.string().default("UTC"),
  clientStatus: z.enum(["active", "pending", "suspended", "archived", "deleted"]).default("active"),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const clientContactSchema = z.object({
  name: z.string().min(2, "Contact name required."),
  role: z.enum(["owner", "billing", "technical", "support", "custom"]),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  notes: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export type ClientContactValues = z.infer<typeof clientContactSchema>;

export const clientNoteSchema = z.object({
  content: z.string().min(3, "Note content cannot be empty."),
  isPinned: z.boolean().default(false),
});

export type ClientNoteValues = z.infer<typeof clientNoteSchema>;
