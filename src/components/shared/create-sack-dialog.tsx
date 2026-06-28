"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sackCreateSchema,
  type SackCreateFormValues,
} from "@/schemas/sack.schema";
import { sacksService } from "@/services/sacks.service";
import { locationsService } from "@/services/locations.service";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCanManageSacks } from "@/hooks/use-permissions";
import { getApiErrorMessage } from "@/lib/api-client";

// Sentinel value used by the Select to represent "no destination chosen".
// Stored as a literal string instead of empty so shadcn's Select (which
// disallows "" as an item value) is happy.
const NO_DESTINATION = "__none__";

export function CreateSackDialog() {
  const [open, setOpen] = useState(false);
  const { groupId } = useWorkspace();
  const canManageSacks = useCanManageSacks();
  const qc = useQueryClient();

  const form = useForm<SackCreateFormValues>({
    resolver: zodResolver(sackCreateSchema),
    defaultValues: {
      sack_code: "",
      group_id: groupId ?? "",
      origin_location_id: NO_DESTINATION,
      destination_location_id: NO_DESTINATION,
    },
    values: {
      sack_code: "",
      group_id: groupId ?? "",
      origin_location_id: NO_DESTINATION,
      destination_location_id: NO_DESTINATION,
    },
  });

  // Load locations from the same group so the store can pick a target.
  // Only enabled once the dialog is open + we have a group_id; the
  // permission gate below would otherwise fire requests for guests.
  const locationsQ = useQuery({
    queryKey: ["locations", { group_id: groupId }],
    queryFn: () =>
      locationsService.list({ group_id: groupId!, per_page: 100 }),
    enabled: open && Boolean(groupId) && canManageSacks,
  });

  const mutation = useMutation({
    mutationFn: (values: SackCreateFormValues) =>
      sacksService.create({
        sack_code: values.sack_code,
        group_id: values.group_id,
        // Normalize the "none" sentinel into a real null so the API does
        // not receive a literal "__none__" string.
        origin_location_id:
          values.origin_location_id &&
          values.origin_location_id !== NO_DESTINATION
            ? values.origin_location_id
            : null,
        destination_location_id:
          values.destination_location_id &&
          values.destination_location_id !== NO_DESTINATION
            ? values.destination_location_id
            : null,
      }),
    onSuccess: () => {
      toast.success("Sack created");
      qc.invalidateQueries({ queryKey: ["sacks"] });
      setOpen(false);
      form.reset();
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Could not create sack")),
  });

  if (!canManageSacks) {
    // Only ORG_ADMIN and STORE_MAINTAINER can create sacks (matches backend).
    return null;
  }

  const locations = locationsQ.data?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!groupId}>
          <Plus className="size-4" />
          New sack
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create sack</DialogTitle>
          <DialogDescription>
            Group multiple assets together for movement and pickup.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="sack_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sack code</FormLabel>
                  <FormControl>
                    <Input placeholder="SACK-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="origin_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From (origin)</FormLabel>
                  <Select
                    value={field.value || NO_DESTINATION}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Where this sack starts" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_DESTINATION}>
                        No origin set
                      </SelectItem>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                          {l.building ? ` · ${l.building}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Where the sack starts its journey. Editable later by
                    org admins / store managers — even in transit.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To (destination)</FormLabel>
                  <Select
                    value={field.value || NO_DESTINATION}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose where this sack should be delivered" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_DESTINATION}>
                        No destination yet
                      </SelectItem>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                          {l.building ? ` · ${l.building}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The intended drop-off location. Can be edited later by
                    an org admin or store manager — even while in transit.
                  </p>
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
                Create sack
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
