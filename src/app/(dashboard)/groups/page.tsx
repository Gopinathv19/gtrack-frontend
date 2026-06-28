"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Plus } from "lucide-react";
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
  groupCreateSchema,
  type GroupCreateFormValues,
} from "@/schemas/organization.schema";
import { useWorkspace } from "@/hooks/use-workspace";
import { useIsOrgAdmin } from "@/hooks/use-permissions";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime, truncateId } from "@/lib/utils";

export default function GroupsPage() {
  const { instanceId } = useWorkspace();
  const isOrgAdmin = useIsOrgAdmin();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["groups", instanceId],
    queryFn: () => organizationsService.listGroups(instanceId!, { per_page: 100 }),
    enabled: Boolean(instanceId),
  });

  const form = useForm<GroupCreateFormValues>({
    resolver: zodResolver(groupCreateSchema),
    defaultValues: { name: "", description: "" },
  });

  const mutation = useMutation({
    mutationFn: (v: GroupCreateFormValues) =>
      organizationsService.createGroup(instanceId!, v),
    onSuccess: () => {
      toast.success("Group created");
      qc.invalidateQueries({ queryKey: ["groups"] });
      setOpen(false);
      form.reset();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const items = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Groups"
        description="Operational units within an instance — e.g. depots, regions, teams."
        actions={
          isOrgAdmin ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={!instanceId}>
                <Plus className="size-4" />
                New group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create group</DialogTitle>
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
                          <Input placeholder="North depot" {...field} />
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
          ) : null
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <WorkspaceSwitcher compact />
          {!instanceId ? (
            <EmptyState
              title="Pick an instance"
              icon={<Building2 className="size-5" />}
            />
          ) : query.isLoading ? (
            <DataTableSkeleton rows={3} />
          ) : items.length === 0 ? (
            <EmptyState title="No groups yet" icon={<Building2 className="size-5" />} />
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
                  {items.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {g.description ?? "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDateTime(g.created_at)}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">
                        {truncateId(g.id)}
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
