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
import {
  sackCreateSchema,
  type SackCreateFormValues,
} from "@/schemas/sack.schema";
import { sacksService } from "@/services/sacks.service";
import { useWorkspace } from "@/hooks/use-workspace";
import { getApiErrorMessage } from "@/lib/api-client";

export function CreateSackDialog() {
  const [open, setOpen] = useState(false);
  const { groupId } = useWorkspace();
  const qc = useQueryClient();

  const form = useForm<SackCreateFormValues>({
    resolver: zodResolver(sackCreateSchema),
    defaultValues: { sack_code: "", group_id: groupId ?? "" },
    values: { sack_code: "", group_id: groupId ?? "" },
  });

  const mutation = useMutation({
    mutationFn: sacksService.create,
    onSuccess: () => {
      toast.success("Sack created");
      qc.invalidateQueries({ queryKey: ["sacks"] });
      setOpen(false);
      form.reset();
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Could not create sack")),
  });

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
