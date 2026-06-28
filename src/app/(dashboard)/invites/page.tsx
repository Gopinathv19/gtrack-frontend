"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, Plus, RotateCcw, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton";
import { WorkspaceSwitcher } from "@/components/shared/workspace-switcher";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invitesService } from "@/services/invites.service";
import { usersService } from "@/services/users.service";
import {
  inviteCreateSchema,
  type InviteCreateFormValues,
} from "@/schemas/invite.schema";
import { useWorkspace } from "@/hooks/use-workspace";
import { useIsOrgAdmin } from "@/hooks/use-permissions";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";

export default function InvitesPage() {
  const { groupId } = useWorkspace();
  const isOrgAdmin = useIsOrgAdmin();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const invitesQ = useQuery({
    queryKey: ["invites"],
    queryFn: invitesService.list,
  });
  const rolesQ = useQuery({
    queryKey: ["roles"],
    queryFn: usersService.listRoles,
  });

  const form = useForm<InviteCreateFormValues>({
    resolver: zodResolver(inviteCreateSchema),
    defaultValues: { email: "", role_id: "", group_id: groupId ?? "" },
    values: { email: "", role_id: "", group_id: groupId ?? "" },
  });

  const createMut = useMutation({
    mutationFn: invitesService.create,
    onSuccess: (data) => {
      toast.success("Invite sent", {
        description: "Share the accept URL with your teammate.",
        action: {
          label: "Copy link",
          onClick: () => {
            navigator.clipboard.writeText(data.accept_url);
            toast.success("Link copied");
          },
        },
      });
      qc.invalidateQueries({ queryKey: ["invites"] });
      setOpen(false);
      form.reset();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const resendMut = useMutation({
    mutationFn: (id: string) => invitesService.resend(id),
    onSuccess: () => toast.success("Invite resent"),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const revokeMut = useMutation({
    mutationFn: (id: string) => invitesService.revoke(id),
    onSuccess: () => {
      toast.success("Invite revoked");
      qc.invalidateQueries({ queryKey: ["invites"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const items = invitesQ.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invites"
        description="Invite teammates to join groups within your organization."
        actions={
          isOrgAdmin ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={!groupId}>
                <Plus className="size-4" />
                New invite
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite a teammate</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((v) => createMut.mutate(v))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="teammate@company.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pick a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(rolesQ.data ?? []).map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name.replaceAll("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    <Button type="submit" disabled={createMut.isPending}>
                      {createMut.isPending && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Send invite
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

          {invitesQ.isLoading ? (
            <DataTableSkeleton rows={4} />
          ) : items.length === 0 ? (
            <EmptyState
              title="No invites yet"
              description="Invite teammates so they can join groups and start collaborating."
              icon={<UserPlus className="size-5" />}
            />
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.email}</TableCell>
                      <TableCell>
                        <StatusBadge value={inv.status} variant="invite" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {formatDateTime(inv.expires_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={inv.status !== "PENDING" || resendMut.isPending}
                            onClick={() => resendMut.mutate(inv.id)}
                            aria-label="Resend invite"
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={inv.status !== "PENDING"}
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${location.origin}/accept-invite?token=`,
                              );
                              toast.success("Base accept URL copied");
                            }}
                            aria-label="Copy invite URL"
                          >
                            <Copy className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={inv.status !== "PENDING"}
                            onClick={() => revokeMut.mutate(inv.id)}
                            aria-label="Revoke invite"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
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
