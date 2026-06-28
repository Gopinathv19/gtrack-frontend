import { z } from "zod";

import { AssetMovementAction } from "@/types";

export const assetCreateSchema = z.object({
  ticket_id: z
    .string()
    .length(6, "Ticket ID must be exactly 6 characters")
    .regex(/^[A-Za-z0-9]{6}$/, "Ticket ID must be alphanumeric"),
  asset_type: z.string().min(1, "Asset type is required").max(100),
  serial_number: z.string().optional(),
  description: z.string().optional(),
  instance_id: z.string().uuid("Instance is required"),
  group_id: z.string().uuid("Group is required"),
  current_location_id: z.string().uuid().optional().or(z.literal("")),
});
export type AssetCreateFormValues = z.infer<typeof assetCreateSchema>;

export const assetBulkCreateSchema = z.object({
  instance_id: z.string().uuid(),
  group_id: z.string().uuid(),
  asset_type: z.string().min(1).max(100),
  tickets_raw: z
    .string()
    .min(1, "Please enter at least one ticket ID")
    .refine(
      (val) =>
        val
          .split(/[\s,]+/)
          .filter(Boolean)
          .every((t) => /^[A-Za-z0-9]{6}$/.test(t)),
      "All ticket IDs must be 6 alphanumeric characters",
    ),
});
export type AssetBulkCreateFormValues = z.infer<typeof assetBulkCreateSchema>;

export const assetMovementSchema = z.object({
  action: z.nativeEnum(AssetMovementAction),
  from_location_id: z.string().uuid().optional().or(z.literal("")),
  to_location_id: z.string().uuid().optional().or(z.literal("")),
  remarks: z.string().optional(),
});
export type AssetMovementFormValues = z.infer<typeof assetMovementSchema>;
