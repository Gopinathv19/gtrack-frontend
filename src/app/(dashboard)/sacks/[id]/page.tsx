"use client";

import { use } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Boxes, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { sacksService } from "@/services/sacks.service";
import { SackStatus } from "@/types";
import { formatDateTime, truncateId } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api-client";
import { ROUTES } from "@/constants";

export default function SackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const qc = useQueryClient();

  const sackQ = useQuery({
    queryKey: ["sack", id],
    queryFn: () => sacksService.get(id),
  });
  const movementsQ = useQuery({
    queryKey: ["sack-movements", id],
    queryFn: () => sacksService.listMovements(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["sack", id] });
    qc.invalidateQueries({ queryKey: ["sack-movements", id] });
    qc.invalidateQueries({ queryKey: ["sacks"] });
  };

  const pickupMut = useMutation({
    mutationFn: () => sacksService.pickup(id, {}),
    onSuccess: () => {
      toast.success("Sack picked up");
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const deliverMut = useMutation({
    mutationFn: () => sacksService.deliver(id, {}),
    onSuccess: () => {
      toast.success("Sack delivered");
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const closeMut = useMutation({
    mutationFn: () => sacksService.close(id, {}),
    onSuccess: () => {
      toast.success("Sack closed");
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (sackQ.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  const sack = sackQ.data;
  if (!sack) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={ROUTES.SACKS}>
            <ArrowLeft className="size-4" />
            Back to sacks
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">Sack not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={ROUTES.SACKS}>
          <ArrowLeft className="size-4" />
          Back to sacks
        </Link>
      </Button>

      <PageHeader
        title={sack.sack_code}
        description={`Sack · ID ${truncateId(sack.id)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={sack.status} variant="sack" />
            <Button
              size="sm"
              variant="outline"
              disabled={sack.status !== SackStatus.CREATED || pickupMut.isPending}
              onClick={() => pickupMut.mutate()}
            >
              {pickupMut.isPending && <Loader2 className="size-4 animate-spin" />}
              Mark picked up
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={
                sack.status !== SackStatus.PICKED_UP &&
                sack.status !== SackStatus.IN_TRANSIT
              }
              onClick={() => deliverMut.mutate()}
            >
              {deliverMut.isPending && <Loader2 className="size-4 animate-spin" />}
              Mark delivered
            </Button>
            <Button
              size="sm"
              disabled={sack.status !== SackStatus.DELIVERED || closeMut.isPending}
              onClick={() => closeMut.mutate()}
            >
              {closeMut.isPending && <Loader2 className="size-4 animate-spin" />}
              Close sack
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movements</CardTitle>
          <p className="text-sm text-muted-foreground">
            Lifecycle events recorded for this sack.
          </p>
        </CardHeader>
        <CardContent>
          {movementsQ.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (movementsQ.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No movements yet.</p>
          ) : (
            <ol className="relative space-y-4 border-l pl-5">
              {movementsQ.data!.map((m) => (
                <li key={m.id} className="relative">
                  <span className="absolute -left-[26px] top-1.5 grid size-3 place-items-center rounded-full bg-indigo-500 ring-4 ring-background">
                    <Boxes className="size-2 text-white" aria-hidden />
                  </span>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">
                      {m.action.replaceAll("_", " ")}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="size-3.5" />
                      {formatDateTime(m.created_at)}
                    </p>
                  </div>
                  {m.remarks && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{m.remarks}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
