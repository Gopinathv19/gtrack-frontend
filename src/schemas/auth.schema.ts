import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const acceptInviteSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;
