"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Package,
  Truck,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { assetsService } from "@/services/assets.service";
import { sacksService } from "@/services/sacks.service";
import { AssetStatus, SackStatus } from "@/types";
import { formatDateTime, truncateId } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { useAuth } from "@/store/auth-store";

export default function DashboardPage() {
  const { email } = useAuth();

  const assetsQuery = useQuery({
    queryKey: ["assets", { per_page: 100 }],
    queryFn: () => assetsService.list({ per_page: 100 }),
  });

  const sacksQuery = useQuery({
    queryKey: ["sacks", { per_page: 100 }],
    queryFn: () => sacksService.list({ per_page: 100 }),
  });

  const assets = assetsQuery.data?.items ?? [];
  const sacks = sacksQuery.data?.items ?? [];

  const totalAssets = assetsQuery.data?.total ?? 0;
  const inTransit = assets.filter((a) => a.status === AssetStatus.IN_TRANSIT).length;
  const delivered = assets.filter(
    (a) => a.status === AssetStatus.DELIVERED || a.status === AssetStatus.RECEIVED,
  ).length;
  const sacksOpen = sacks.filter((s) => s.status !== SackStatus.CLOSED).length;

  const recentAssets = [...assets]
    .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={
          email
            ? `Welcome back, ${email.split("@")[0]}. Here's what's happening across your fleet.`
            : "Welcome back. Here's what's happening across your fleet."
        }
        actions={
          <Button asChild>
            <Link href={ROUTES.ASSETS}>
              View all assets
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total assets"
          value={assetsQuery.isLoading ? "—" : totalAssets.toLocaleString()}
          icon={Package}
          hint="All time"
        />
        <StatCard
          label="In transit"
          value={assetsQuery.isLoading ? "—" : inTransit}
          icon={Truck}
          hint="Currently on the move"
        />
        <StatCard
          label="Delivered"
          value={assetsQuery.isLoading ? "—" : delivered}
          icon={CheckCircle2}
          hint="Marked delivered or received"
        />
        <StatCard
          label="Open sacks"
          value={sacksQuery.isLoading ? "—" : sacksOpen}
          icon={Boxes}
          hint="Not yet closed"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent assets</CardTitle>
              <p className="text-sm text-muted-foreground">
                Last 6 assets updated in your workspace.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={ROUTES.ASSETS}>
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {assetsQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentAssets.length === 0 ? (
              <EmptyState
                title="No assets yet"
                description="Create your first asset to start tracking."
                action={
                  <Button asChild size="sm">
                    <Link href={ROUTES.ASSETS}>Go to assets</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y">
                {recentAssets.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`${ROUTES.ASSETS}/${a.id}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {a.ticket_id}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.asset_type} · updated {formatDateTime(a.updated_at)}
                      </p>
                    </div>
                    <StatusBadge value={a.status} variant="asset" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Jump straight into common tasks.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Create new asset", href: ROUTES.ASSETS, icon: Package },
              { label: "Create new sack", href: ROUTES.SACKS, icon: Boxes },
              { label: "Manage locations", href: ROUTES.LOCATIONS, icon: Clock },
              { label: "Invite a teammate", href: ROUTES.INVITES, icon: Truck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-lg border bg-background px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="size-4 text-muted-foreground" />
                    {item.label}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active sacks</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sacks currently in your operations pipeline.
          </p>
        </CardHeader>
        <CardContent>
          {sacksQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sacks.length === 0 ? (
            <EmptyState
              title="No sacks created yet"
              description="Sacks let you group assets for movements together."
              action={
                <Button asChild size="sm">
                  <Link href={ROUTES.SACKS}>Go to sacks</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sacks.slice(0, 6).map((s) => (
                <Link
                  key={s.id}
                  href={`${ROUTES.SACKS}/${s.id}`}
                  className="group rounded-lg border bg-background p-3 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-mono text-sm font-medium">
                      {s.sack_code}
                    </p>
                    <StatusBadge value={s.status} variant="sack" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ID {truncateId(s.id)} · {formatDateTime(s.updated_at)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
