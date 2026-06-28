import { z } from "zod";

export const sackCreateSchema = z.object({
  sack_code: z
    .string()
    .min(1, "Sack code is required")
    .max(64, "Sack code is too long"),
  group_id: z.string().uuid("Group is required"),
});
export type SackCreateFormValues = z.infer<typeof sackCreateSchema>;

export const sackActionSchema = z.object({
  from_location_id: z.string().uuid().optional().or(z.literal("")),
  to_location_id: z.string().uuid().optional().or(z.literal("")),
  remarks: z.string().optional(),
});
export type SackActionFormValues = z.infer<typeof sackActionSchema>;
