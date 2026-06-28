"use client";

import { use } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Boxes,
  Calendar,
  Loader2,
  MapPin,
  Package,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { AddAssetsToSackDialog } from "@/components/shared/add-assets-to-sack-dialog";
import { EditSackDestinationDialog } from "@/components/shared/edit-sack-destination-dialog";
import { EditSackOriginDialog } from "@/components/shared/edit-sack-origin-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { sacksService } from "@/services/sacks.service";
import { SackStatus } from "@/types";
import {
  useCanManageSacks,
  useCanReceiveSacks,
  useCanShiftSacks,
} from "@/hooks/use-permissions";
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

  const canManageSacks = useCanManageSacks();
  const canShiftSacks = useCanShiftSacks();
  const canReceiveSacks = useCanReceiveSacks();

  const sackQ = useQuery({
    queryKey: ["sack", id],
    queryFn: () => sacksService.get(id),
  });
  const movementsQ = useQuery({
    queryKey: ["sack-movements", id],
    queryFn: () => sacksService.listMovements(id),
  });
  const assetsQ = useQuery({
    queryKey: ["sack-assets", id],
    queryFn: () => sacksService.listAssets(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["sack", id] });
    qc.invalidateQueries({ queryKey: ["sack-movements", id] });
    qc.invalidateQueries({ queryKey: ["sack-assets", id] });
    qc.invalidateQueries({ queryKey: ["sacks"] });
    qc.invalidateQueries({ queryKey: ["assets"] });
  };

  const removeAssetMut = useMutation({
    mutationFn: (assetId: string) => sacksService.removeAsset(id, assetId),
    onSuccess: () => {
      toast.success("Asset removed from sack");
      invalidate();
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Could not remove asset")),
  });

  const pickupMut = useMutation({
    mutationFn: () => sacksService.pickup(id, {}),
    onSuccess: () => {
      toast.success("Sack picked up — in transit");
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
  const receiveMut = useMutation({
    mutationFn: () => sacksService.receive(id, {}),
    onSuccess: () => {
      toast.success("Sack received");
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
        description={
          <>
            <span>Sack · ID {truncateId(sack.id)}</span>
            {sack.created_by_name && (
              <>
                <span className="mx-1.5 text-muted-foreground/60">·</span>
                <span>
                  Created by{" "}
                  <span className="font-medium text-foreground">
                    {sack.created_by_name}
                  </span>
                  {sack.created_by_email && (
                    <span className="ml-1 text-muted-foreground">
                      ({sack.created_by_email})
                    </span>
                  )}
                </span>
              </>
            )}
            <span className="mx-1.5 text-muted-foreground/60">·</span>
            <span>{formatDateTime(sack.created_at)}</span>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={sack.status} variant="sack" />
            {canShiftSacks && (
              <Button
                size="sm"
                variant="outline"
                disabled={sack.status !== SackStatus.CREATED || pickupMut.isPending}
                onClick={() => pickupMut.mutate()}
                title="Shifting person picks up the sack"
              >
                {pickupMut.isPending && <Loader2 className="size-4 animate-spin" />}
                Pick up
              </Button>
            )}
            {canShiftSacks && (
              <Button
                size="sm"
                variant="outline"
                disabled={
                  sack.status !== SackStatus.IN_TRANSIT || deliverMut.isPending
                }
                onClick={() => deliverMut.mutate()}
                title="Shifting person delivers the sack"
              >
                {deliverMut.isPending && <Loader2 className="size-4 animate-spin" />}
                Mark delivered
              </Button>
            )}
            {canReceiveSacks && (
              <Button
                size="sm"
                disabled={
                  sack.status !== SackStatus.DELIVERED || receiveMut.isPending
                }
                onClick={() => receiveMut.mutate()}
                title="Sysadmin confirms receipt"
              >
                {receiveMut.isPending && <Loader2 className="size-4 animate-spin" />}
                Mark received
              </Button>
            )}
          </div>
        }
      />

      {/* Origin + Destination cards — show where the sack starts and
          where it's headed. Editable by ORG_ADMIN / STORE_MAINTAINER
          at any point before RECEIVED (including while in transit). */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div className="min-w-0">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                Origin
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {sack.origin_location_name ? (
                  <>
                    Starts at{" "}
                    <span className="font-medium text-foreground">
                      {sack.origin_location_name}
                    </span>
                    .
                  </>
                ) : (
                  "No origin assigned yet."
                )}
              </p>
            </div>
            <EditSackOriginDialog sack={sack} />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div className="min-w-0">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                Destination
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {sack.destination_location_name ? (
                  <>
                    Headed to{" "}
                    <span className="font-medium text-foreground">
                      {sack.destination_location_name}
                    </span>
                    .
                  </>
                ) : (
                  "No destination assigned yet."
                )}
              </p>
            </div>
            <EditSackDestinationDialog sack={sack} />
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">
              Assets in sack
              {assetsQ.data && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({assetsQ.data.length})
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {sack.status === SackStatus.CREATED
                ? "Add or remove assets while the sack is still open."
                : "This sack is sealed — its assets are read-only."}
            </p>
          </div>
          <AddAssetsToSackDialog sack={sack} />
        </CardHeader>
        <CardContent>
          {assetsQ.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (assetsQ.data ?? []).length === 0 ? (
            <EmptyState
              title="No assets in this sack yet"
              description={
                canManageSacks && sack.status === SackStatus.CREATED
                  ? "Use “Add assets” above to pack assets into this sack."
                  : "Nothing to display."
              }
              icon={<Package className="size-5" />}
            />
          ) : (
            <ul className="divide-y rounded-md border">
              {assetsQ.data!.map((asset) => (
                <li
                  key={asset.id}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <Package className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      <Link
                        href={`${ROUTES.ASSETS}/${asset.id}`}
                        className="font-mono hover:underline"
                      >
                        {asset.ticket_id}
                      </Link>
                      <span className="ml-2 font-normal text-muted-foreground">
                        · {asset.asset_type}
                      </span>
                    </p>
                    {asset.serial_number && (
                      <p className="truncate text-xs text-muted-foreground">
                        SN: {asset.serial_number}
                      </p>
                    )}
                  </div>
                  <StatusBadge value={asset.status} variant="asset" />
                  {canManageSacks && sack.status === SackStatus.CREATED && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${asset.ticket_id} from sack`}
                      onClick={() => removeAssetMut.mutate(asset.id)}
                      disabled={removeAssetMut.isPending}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movement history</CardTitle>
          <p className="text-sm text-muted-foreground">
            Who did what, and where — oldest first.
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
            <ol className="relative space-y-5 border-l pl-5">
              {movementsQ.data!.map((m) => {
                const actorLabel =
                  m.performed_by_name ??
                  m.performed_by_email ??
                  truncateId(m.performed_by);
                const fromLabel = m.from_location_name;
                const toLabel = m.to_location_name;
                return (
                  <li key={m.id} className="relative">
                    <span className="absolute -left-[26px] top-1.5 grid size-3 place-items-center rounded-full bg-indigo-500 ring-4 ring-background">
                      <Boxes className="size-2 text-white" aria-hidden />
                    </span>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {m.action.replaceAll("_", " ")}
                          <span className="ml-2 font-normal text-muted-foreground">
                            by <span className="text-foreground">{actorLabel}</span>
                          </span>
                        </p>
                        {(fromLabel || toLabel) && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {fromLabel && toLabel
                              ? `${fromLabel} → ${toLabel}`
                              : toLabel
                                ? `At ${toLabel}`
                                : `From ${fromLabel}`}
                          </p>
                        )}
                        {m.performed_by_email &&
                          m.performed_by_email !== actorLabel && (
                            <p className="text-[11px] text-muted-foreground/80">
                              {m.performed_by_email}
                            </p>
                          )}
                      </div>
                      <p className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {formatDateTime(m.created_at)}
                      </p>
                    </div>
                    {m.remarks && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {m.remarks}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
