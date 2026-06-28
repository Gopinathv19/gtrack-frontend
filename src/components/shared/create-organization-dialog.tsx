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
  organizationCreateSchema,
  type OrganizationCreateFormValues,
} from "@/schemas/organization.schema";
import { organizationsService } from "@/services/organizations.service";
import { useWorkspaceStore } from "@/store/workspace-store";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Organization } from "@/types";

interface CreateOrganizationDialogProps {
  /** Render a compact/secondary button instead of the default primary one. */
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "icon";
  /** Label shown on the trigger button. */
  label?: string;
  /** Called after a successful create, with the new org. */
  onCreated?: (org: Organization) => void;
  /** Show only an icon (no label) on the trigger button. */
  iconOnly?: boolean;
}

export function CreateOrganizationDialog({
  variant = "default",
  size = "default",
  label = "New organization",
  onCreated,
  iconOnly = false,
}: CreateOrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const setOrganization = useWorkspaceStore((s) => s.setOrganization);

  const form = useForm<OrganizationCreateFormValues>({
    resolver: zodResolver(organizationCreateSchema),
    defaultValues: { name: "", description: "" },
  });

  const mutation = useMutation({
    mutationFn: organizationsService.create,
    onSuccess: (org) => {
      toast.success("Organization created");
      qc.invalidateQueries({ queryKey: ["organizations"] });
      // Switch the active workspace to the newly created org.
      setOrganization(org.id);
      onCreated?.(org);
      setOpen(false);
      form.reset();
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Could not create organization")),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} aria-label={label}>
          <Plus className="size-4" />
          {!iconOnly && <span>{label}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Organizations are top-level workspaces. You can rename them later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Logistics" {...field} />
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
                      rows={3}
                      placeholder="Short description of this organization…"
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
                Create organization
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
