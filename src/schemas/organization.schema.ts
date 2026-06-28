import { z } from "zod";

export const organizationCreateSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(255),
  description: z.string().optional(),
});
export type OrganizationCreateFormValues = z.infer<typeof organizationCreateSchema>;

export const instanceCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});
export type InstanceCreateFormValues = z.infer<typeof instanceCreateSchema>;

export const groupCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});
export type GroupCreateFormValues = z.infer<typeof groupCreateSchema>;
