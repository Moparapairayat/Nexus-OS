import { z } from "zod";

export const invoiceItemSchema = z.object({
  title: z.string().min(2, "Item title required."),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1."),
  unitPrice: z.number().min(0, "Unit price cannot be negative."),
  discount: z.number().default(0),
  taxRate: z.number().default(0),
  serviceId: z.string().optional(),
  serviceName: z.string().optional(),
});

export type InvoiceItemValues = z.infer<typeof invoiceItemSchema>;

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client account."),
  billingType: z.enum(["one_time", "recurring", "renewal", "manual", "custom", "usage"]).default("one_time"),
  issueDate: z.string().optional(),
  dueDate: z.string().min(1, "Due date required."),
  currency: z.string().default("USD"),
  taxRate: z.number().default(0),
  discountAmount: z.number().default(0),
  notes: z.string().optional(),
  clientNotes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "Invoice must contain at least 1 line item."),
});

export type CreateInvoiceValues = z.infer<typeof createInvoiceSchema>;
