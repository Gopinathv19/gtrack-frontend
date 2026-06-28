"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceSwitcher } from "@/components/shared/workspace-switcher";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { organizationsService } from "@/services/organizations.service";
import {
  instanceCreateSchema,
  type InstanceCreateFormValues,
} from "@/schemas/organization.schema";
import { useWorkspace } from "@/hooks/use-workspace";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime, truncateId } from "@/lib/utils";

export default function InstancesPage() {
  const { organizationId } = useWorkspace();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["instances", organizationId],
    queryFn: () =>
      organizationsService.listInstances(organizationId!, { per_page: 100 }),
    enabled: Boolean(organizationId),
  });

  const form = useForm<InstanceCreateFormValues>({
    resolver: zodResolver(instanceCreateSchema),
    defaultValues: { name: "", description: "" },
  });

  const mutation = useMutation({
    mutationFn: (v: InstanceCreateFormValues) =>
      organizationsService.createInstance(organizationId!, v),
    onSuccess: () => {
      toast.success("Instance created");
      qc.invalidateQueries({ queryKey: ["instances"] });
      setOpen(false);
      form.reset();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const items = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instances"
        description="Logical environments within an organization (e.g. production, staging, regions)."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={!organizationId}>
                <Plus className="size-4" />
                New instance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create instance</DialogTitle>
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
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Production" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
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
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <WorkspaceSwitcher compact />
          {!organizationId ? (
            <EmptyState
              title="Pick an organization"
              icon={<Layers className="size-5" />}
            />
          ) : query.isLoading ? (
            <DataTableSkeleton rows={3} />
          ) : items.length === 0 ? (
            <EmptyState title="No instances yet" icon={<Layers className="size-5" />} />
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead className="hidden xl:table-cell">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {i.description ?? "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDateTime(i.created_at)}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">
                        {truncateId(i.id)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
