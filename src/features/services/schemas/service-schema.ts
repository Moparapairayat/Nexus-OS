import { z } from "zod";

export const serviceCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
  iconName: z.string().default("Package"),
  description: z.string().min(3, "Description required."),
  color: z.string().optional(),
});

export type ServiceCategoryValues = z.infer<typeof serviceCategorySchema>;

export const serviceTemplateSchema = z.object({
  categoryId: z.string().min(1, "Please select a category."),
  name: z.string().min(2, "Template name required."),
  description: z.string().min(3, "Description required."),
  iconName: z.string().default("Package"),
  defaultPrice: z.number().min(0, "Price cannot be negative."),
  currency: z.string().default("USD"),
  billingCycle: z.enum(["one_time", "monthly", "quarterly", "semi_annual", "annual", "biennial"]).default("monthly"),
  renewable: z.boolean().default(true),
  autoRenewal: z.boolean().default(true),
  visibility: z.enum(["public", "private"]).default("public"),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  defaultNotes: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
});

export type ServiceTemplateValues = z.infer<typeof serviceTemplateSchema>;

export const assignServiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client."),
  templateId: z.string().optional().or(z.literal("")),
  customName: z.string().min(2, "Service / Asset name required."),
  categoryId: z.string().min(1, "Please select a category."),
  customPrice: z.number().min(0, "Price cannot be negative."),
  currency: z.string().default("USD"),
  billingCycle: z.enum(["one_time", "monthly", "quarterly", "semi_annual", "annual", "biennial"]).default("monthly"),
  domainName: z.string().optional().or(z.literal("")),
  serverIp: z.string().optional().or(z.literal("")),
  cloudflareZoneId: z.string().optional().or(z.literal("")),
  autoRenewal: z.boolean().default(true),
  renewalDate: z.string().optional().or(z.literal("")),
  serviceStatus: z.enum(["draft", "pending", "provisioning", "active", "suspended", "expired", "cancelled", "archived"]).default("active"),
  internalNotes: z.string().optional().or(z.literal("")),
  clientNotes: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
});

export type AssignServiceValues = z.infer<typeof assignServiceSchema>;
