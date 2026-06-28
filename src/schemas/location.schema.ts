import { z } from "zod";

export const locationCreateSchema = z.object({
  group_id: z.string().uuid("Group is required"),
  name: z.string().min(1, "Name is required").max(255),
  building: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  description: z.string().optional(),
});
export type LocationCreateFormValues = z.infer<typeof locationCreateSchema>;
