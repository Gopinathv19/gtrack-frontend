import { z } from "zod";

export const inviteCreateSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  role_id: z.string().uuid("Role is required"),
  group_id: z.string().uuid("Group is required"),
});
export type InviteCreateFormValues = z.infer<typeof inviteCreateSchema>;
