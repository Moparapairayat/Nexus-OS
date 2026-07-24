import { z } from "zod";

export const acceptInvitationSchema = z
  .object({
    token: z.string().min(1, "Invitation token required."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type AcceptInvitationValues = z.infer<typeof acceptInvitationSchema>;

export const sendInvitationSchema = z.object({
  clientId: z.string().min(1, "Client ID required."),
});
