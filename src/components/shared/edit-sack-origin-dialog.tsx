"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  sackOriginSchema,
  type SackOriginFormValues,
} from "@/schemas/sack.schema";
import { sacksService } from "@/services/sacks.service";
import { locationsService } from "@/services/locations.service";
import { useCanManageSacks } from "@/hooks/use-permissions";
import { getApiErrorMessage } from "@/lib/api-client";
import { SackStatus, type Sack } from "@/types";

const NO_LOCATION = "__none__";

interface EditSackOriginDialogProps {
  sack: Sack;
}

/**
 * Lets an ORG_ADMIN or STORE_MAINTAINER change a sack's origin / source
 * location at any point before it's been RECEIVED — including while the
 * sack is IN_TRANSIT (in case the wrong source was recorded).
 *
 * Backend enforces:
 *  - role (ORG_ADMIN / STORE_MAINTAINER)
 *  - status != RECEIVED
 *  - location belongs to caller's organization
 */
export function EditSackOriginDialog({ sack }: EditSackOriginDialogProps) {
  const [open, setOpen] = useState(false);
  const canManageSacks = useCanManageSacks();
  const qc = useQueryClient();

  const isEditable = sack.status !== SackStatus.RECEIVED;

  const form = useForm<SackOriginFormValues>({
    resolver: zodResolver(sackOriginSchema),
    defaultValues: {
      origin_location_id: sack.origin_location_id ?? NO_LOCATION,
      remarks: "",
    },
  });

  // Keep the form in sync with the latest sack data (e.g. someone else
  // edited the origin in another tab).
  useEffect(() => {
    if (open) {
      form.reset({
        origin_location_id: sack.origin_location_id ?? NO_LOCATION,
        remarks: "",
      });
    }
  }, [open, sack.origin_location_id, form]);

  const locationsQ = useQuery({
    queryKey: ["locations", { group_id: sack.group_id }],
    queryFn: () =>
      locationsService.list({ group_id: sack.group_id, per_page: 100 }),
    enabled: open && canManageSacks,
  });

  const mutation = useMutation({
    mutationFn: (values: SackOriginFormValues) =>
      sacksService.updateOrigin(sack.id, {
        origin_location_id:
          values.origin_location_id &&
          values.origin_location_id !== NO_LOCATION
            ? values.origin_location_id
            : null,
        remarks: values.remarks?.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Origin updated");
      qc.invalidateQueries({ queryKey: ["sack", sack.id] });
      qc.invalidateQueries({ queryKey: ["sack-movements", sack.id] });
      qc.invalidateQueries({ queryKey: ["sacks"] });
      setOpen(false);
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Could not update origin")),
  });

  if (!canManageSacks) return null;

  const locations = locationsQ.data?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!isEditable}
          title={
            isEditable
              ? "Change the source / origin location"
              : "Origin is frozen once the sack is RECEIVED"
          }
        >
          <Pencil className="size-4" />
          Edit origin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit origin</DialogTitle>
          <DialogDescription>
            Change where this sack starts from. Allowed for org admins
            and store managers, even while the sack is in transit.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            Current:{" "}
            <span className="font-medium text-foreground">
              {sack.origin_location_name ?? "Not set"}
            </span>
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="origin_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New origin</FormLabel>
                  <Select
                    value={field.value || NO_LOCATION}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_LOCATION}>No origin</SelectItem>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                          {l.building ? ` · ${l.building}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Wrong source recorded at pack time"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Save origin
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
