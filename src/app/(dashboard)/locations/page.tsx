"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, Plus } from "lucide-react";
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
import { locationsService } from "@/services/locations.service";
import {
  locationCreateSchema,
  type LocationCreateFormValues,
} from "@/schemas/location.schema";
import { useWorkspace } from "@/hooks/use-workspace";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime, truncateId } from "@/lib/utils";

export default function LocationsPage() {
  const { groupId } = useWorkspace();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["locations", { groupId }],
    queryFn: () =>
      locationsService.list({ group_id: groupId ?? undefined, per_page: 100 }),
    enabled: Boolean(groupId),
  });

  const form = useForm<LocationCreateFormValues>({
    resolver: zodResolver(locationCreateSchema),
    defaultValues: {
      group_id: groupId ?? "",
      name: "",
      building: "",
      floor: "",
      room: "",
      description: "",
    },
    values: {
      group_id: groupId ?? "",
      name: "",
      building: "",
      floor: "",
      room: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (v: LocationCreateFormValues) =>
      locationsService.create(v.group_id, {
        name: v.name,
        building: v.building || undefined,
        floor: v.floor || undefined,
        room: v.room || undefined,
        description: v.description || undefined,
      }),
    onSuccess: () => {
      toast.success("Location created");
      qc.invalidateQueries({ queryKey: ["locations"] });
      setOpen(false);
      form.reset({ group_id: groupId ?? "", name: "" });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Could not create location")),
  });

  const items = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description="Physical or logical locations within your groups."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={!groupId}>
                <Plus className="size-4" />
                New location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create location</DialogTitle>
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
                          <Input placeholder="Warehouse A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="building"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Building</FormLabel>
                          <FormControl>
                            <Input placeholder="B1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Floor</FormLabel>
                          <FormControl>
                            <Input placeholder="2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="room"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room</FormLabel>
                          <FormControl>
                            <Input placeholder="201" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
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
                      Create location
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

          {!groupId ? (
            <EmptyState
              title="Select a group"
              description="Pick an organization, instance, and group to see its locations."
              icon={<MapPin className="size-5" />}
            />
          ) : query.isLoading ? (
            <DataTableSkeleton rows={4} />
          ) : items.length === 0 ? (
            <EmptyState
              title="No locations yet"
              description="Add a location to start placing assets and movements."
              icon={<MapPin className="size-5" />}
            />
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Building</TableHead>
                    <TableHead className="hidden md:table-cell">Floor</TableHead>
                    <TableHead className="hidden md:table-cell">Room</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead className="hidden xl:table-cell">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {l.building ?? "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {l.floor ?? "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {l.room ?? "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDateTime(l.created_at)}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">
                        {truncateId(l.id)}
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
