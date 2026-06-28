import { z } from "zod";

// Helper: a UUID string OR an empty/"none" value that we'll normalize to undefined
// before sending to the API. This lets the destination picker render a "None"
// option without forcing the form to be invalid.
const optionalUuid = z
  .string()
  .uuid("Invalid location")
  .optional()
  .or(z.literal(""))
  .or(z.literal("__none__"));

export const sackCreateSchema = z.object({
  sack_code: z
    .string()
    .min(1, "Sack code is required")
    .max(64, "Sack code is too long"),
  group_id: z.string().uuid("Group is required"),
  // The store assigns where this sack starts (origin) and where it's
  // supposed to be delivered (destination). Both are optional so legacy
  // flows keep working; the UI nudges users to pick them.
  origin_location_id: optionalUuid,
  destination_location_id: optionalUuid,
});
export type SackCreateFormValues = z.infer<typeof sackCreateSchema>;

export const sackActionSchema = z.object({
  from_location_id: z.string().uuid().optional().or(z.literal("")),
  to_location_id: z.string().uuid().optional().or(z.literal("")),
  remarks: z.string().optional(),
});
export type SackActionFormValues = z.infer<typeof sackActionSchema>;

export const sackDestinationSchema = z.object({
  destination_location_id: optionalUuid,
  remarks: z.string().optional(),
});
export type SackDestinationFormValues = z.infer<typeof sackDestinationSchema>;

export const sackOriginSchema = z.object({
  origin_location_id: optionalUuid,
  remarks: z.string().optional(),
});
export type SackOriginFormValues = z.infer<typeof sackOriginSchema>;
