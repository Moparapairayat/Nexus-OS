import { z } from "zod";

export const companySetupSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters."),
  logoUrl: z.string().optional(),
  email: z.string().email("Invalid company email address."),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().min(5, "Business address required."),
  country: z.string().min(2, "Country required."),
  timezone: z.string().default("UTC"),
  currency: z.string().default("USD"),
  language: z.string().default("en"),
  termsAndConditions: z.string().optional(),
});

export type CompanySetupValues = z.infer<typeof companySetupSchema>;

export const superAdminSetupSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters."),
    email: z.string().email("Invalid admin email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
      .regex(/[0-9]/, "Must contain at least one number.")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character."),
    confirmPassword: z.string().min(1, "Please confirm password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SuperAdminSetupValues = z.infer<typeof superAdminSetupSchema>;

export const emailSetupSchema = z.object({
  apiKey: z.string().min(5, "Resend API Key required."),
  senderName: z.string().min(2, "Sender name required."),
  senderEmail: z.string().email("Invalid sender email address."),
  replyToEmail: z.string().optional(),
});

export type EmailSetupValues = z.infer<typeof emailSetupSchema>;

export const invoiceSetupSchema = z.object({
  prefix: z.string().default("INV-2026-"),
  startingNumber: z.number().min(1).default(1),
  currency: z.string().default("USD"),
  dueDays: z.number().min(1).default(30),
  taxRate: z.number().min(0).default(5),
  invoiceFooter: z.string().optional(),
  receiptFooter: z.string().optional(),
});

export type InvoiceSetupValues = z.infer<typeof invoiceSetupSchema>;
