"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Hash, MapPin, Package } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { assetsService } from "@/services/assets.service";
import { formatDateTime, truncateId } from "@/lib/utils";
import { ROUTES } from "@/constants";

export default function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const assetQ = useQuery({
    queryKey: ["asset", id],
    queryFn: () => assetsService.get(id),
  });
  const movementsQ = useQuery({
    queryKey: ["asset-movements", id],
    queryFn: () => assetsService.listMovements(id),
  });

  if (assetQ.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  const asset = assetQ.data;
  if (!asset) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={ROUTES.ASSETS}>
            <ArrowLeft className="size-4" />
            Back to assets
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          This asset could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={ROUTES.ASSETS}>
          <ArrowLeft className="size-4" />
          Back to assets
        </Link>
      </Button>

      <PageHeader
        title={asset.ticket_id}
        description={`${asset.asset_type}${asset.serial_number ? ` · SN ${asset.serial_number}` : ""}`}
        actions={<StatusBadge value={asset.status} variant="asset" />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Ticket ID" value={asset.ticket_id} icon={Hash} mono />
            <Field label="Type" value={asset.asset_type} icon={Package} />
            <Field label="Serial number" value={asset.serial_number ?? "—"} />
            <Field
              label="Current location"
              value={
                asset.current_location_id
                  ? truncateId(asset.current_location_id)
                  : "—"
              }
              icon={MapPin}
              mono
            />
            <Field
              label="Created"
              value={formatDateTime(asset.created_at)}
              icon={Calendar}
            />
            <Field
              label="Updated"
              value={formatDateTime(asset.updated_at)}
              icon={Calendar}
            />
            {asset.description && (
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 text-sm">{asset.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hierarchy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Organization" value={truncateId(asset.organization_id)} mono />
            <Field label="Instance" value={truncateId(asset.instance_id)} mono />
            <Field label="Group" value={truncateId(asset.group_id)} mono />
            <Separator />
            <Field label="Created by" value={truncateId(asset.created_by)} mono />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movement history</CardTitle>
          <p className="text-sm text-muted-foreground">
            Every state transition recorded for this asset.
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
                  <span className="absolute -left-[26px] top-1.5 grid size-3 place-items-center rounded-full bg-indigo-500 ring-4 ring-background" />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">
                      {m.action.replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
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

function Field({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: typeof Hash;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </p>
      <p className={`mt-1 text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
