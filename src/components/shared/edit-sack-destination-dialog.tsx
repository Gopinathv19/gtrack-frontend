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
  sackDestinationSchema,
  type SackDestinationFormValues,
} from "@/schemas/sack.schema";
import { sacksService } from "@/services/sacks.service";
import { locationsService } from "@/services/locations.service";
import { useCanManageSacks } from "@/hooks/use-permissions";
import { getApiErrorMessage } from "@/lib/api-client";
import { SackStatus, type Sack } from "@/types";

const NO_DESTINATION = "__none__";

interface EditSackDestinationDialogProps {
  sack: Sack;
}

/**
 * Lets an ORG_ADMIN or STORE_MAINTAINER change a sack's intended drop-off
 * location at any point before it's been RECEIVED — including while the
 * sack is IN_TRANSIT (e.g. the destination warehouse needs to switch
 * mid-shift).
 *
 * Backend enforces:
 *  - role (ORG_ADMIN / STORE_MAINTAINER)
 *  - status != RECEIVED
 *  - location belongs to caller's organization
 */
export function EditSackDestinationDialog({ sack }: EditSackDestinationDialogProps) {
  const [open, setOpen] = useState(false);
  const canManageSacks = useCanManageSacks();
  const qc = useQueryClient();

  // Once the sack has been RECEIVED, the destination is frozen — match
  // the server-side guard so the button doesn't lie about what's possible.
  const isEditable = sack.status !== SackStatus.RECEIVED;

  const form = useForm<SackDestinationFormValues>({
    resolver: zodResolver(sackDestinationSchema),
    defaultValues: {
      destination_location_id: sack.destination_location_id ?? NO_DESTINATION,
      remarks: "",
    },
  });

  // Reset the form whenever the sack's current destination changes
  // (e.g. someone else edited it in another tab). Without this, opening
  // the dialog a second time would still show the original value.
  useEffect(() => {
    if (open) {
      form.reset({
        destination_location_id:
          sack.destination_location_id ?? NO_DESTINATION,
        remarks: "",
      });
    }
  }, [open, sack.destination_location_id, form]);

  const locationsQ = useQuery({
    queryKey: ["locations", { group_id: sack.group_id }],
    queryFn: () =>
      locationsService.list({ group_id: sack.group_id, per_page: 100 }),
    enabled: open && canManageSacks,
  });

  const mutation = useMutation({
    mutationFn: (values: SackDestinationFormValues) =>
      sacksService.updateDestination(sack.id, {
        destination_location_id:
          values.destination_location_id &&
          values.destination_location_id !== NO_DESTINATION
            ? values.destination_location_id
            : null,
        remarks: values.remarks?.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Destination updated");
      qc.invalidateQueries({ queryKey: ["sack", sack.id] });
      qc.invalidateQueries({ queryKey: ["sack-movements", sack.id] });
      qc.invalidateQueries({ queryKey: ["sacks"] });
      setOpen(false);
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Could not update destination")),
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
              ? "Change the intended drop-off location"
              : "Destination is frozen once the sack is RECEIVED"
          }
        >
          <Pencil className="size-4" />
          Edit destination
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit destination</DialogTitle>
          <DialogDescription>
            Change where this sack should be delivered. Allowed for org
            admins and store managers, even while the sack is in transit.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            Current:{" "}
            <span className="font-medium text-foreground">
              {sack.destination_location_name ?? "Not set"}
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
              name="destination_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New destination</FormLabel>
                  <Select
                    value={field.value || NO_DESTINATION}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_DESTINATION}>
                        No destination
                      </SelectItem>
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
                      placeholder="e.g. Recipient warehouse changed mid-route"
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
                Save destination
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
