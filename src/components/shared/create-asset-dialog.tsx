"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import {
  assetCreateSchema,
  type AssetCreateFormValues,
} from "@/schemas/asset.schema";
import { assetsService } from "@/services/assets.service";
import { useWorkspace } from "@/hooks/use-workspace";
import { getApiErrorMessage } from "@/lib/api-client";

export function CreateAssetDialog() {
  const [open, setOpen] = useState(false);
  const { instanceId, groupId } = useWorkspace();
  const qc = useQueryClient();

  const form = useForm<AssetCreateFormValues>({
    resolver: zodResolver(assetCreateSchema),
    defaultValues: {
      ticket_id: "",
      asset_type: "",
      serial_number: "",
      description: "",
      instance_id: instanceId ?? "",
      group_id: groupId ?? "",
      current_location_id: "",
    },
    values: {
      ticket_id: "",
      asset_type: "",
      serial_number: "",
      description: "",
      instance_id: instanceId ?? "",
      group_id: groupId ?? "",
      current_location_id: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (v: AssetCreateFormValues) =>
      assetsService.create({
        ticket_id: v.ticket_id,
        asset_type: v.asset_type,
        serial_number: v.serial_number || undefined,
        description: v.description || undefined,
        instance_id: v.instance_id,
        group_id: v.group_id,
        current_location_id: v.current_location_id || null,
      }),
    onSuccess: () => {
      toast.success("Asset created");
      qc.invalidateQueries({ queryKey: ["assets"] });
      setOpen(false);
      form.reset();
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Could not create asset")),
  });

  const disabled = !instanceId || !groupId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="size-4" />
          New asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create asset</DialogTitle>
          <DialogDescription>
            Register a new ticket to start tracking it through the lifecycle.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="ticket_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABC123"
                      maxLength={6}
                      autoComplete="off"
                      className="uppercase tracking-wider"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="asset_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset type</FormLabel>
                  <FormControl>
                    <Input placeholder="Laptop, monitor, keyboard…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serial_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial number (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="SN-12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any extra context about this asset…"
                      className="resize-none"
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
                Create asset
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
