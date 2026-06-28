"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { SearchInput } from "@/components/shared/search-input";
import { WorkspaceSwitcher } from "@/components/shared/workspace-switcher";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton";
import { CreateAssetDialog } from "@/components/shared/create-asset-dialog";
import { Card, CardContent } from "@/components/ui/card";
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
import { assetsService } from "@/services/assets.service";
import { AssetStatus } from "@/types";
import { useWorkspace } from "@/hooks/use-workspace";
import { useDebounce } from "@/hooks/use-debounce";
import { DEFAULT_PAGE_SIZE, ROUTES } from "@/constants";
import { formatDateTime, truncateId } from "@/lib/utils";

const STATUSES: { value: AssetStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  ...Object.values(AssetStatus).map((s) => ({ value: s, label: s.replaceAll("_", " ") })),
];

export default function AssetsPage() {
  const { instanceId, groupId } = useWorkspace();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AssetStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery({
    queryKey: [
      "assets",
      { page, status, instanceId, groupId, per_page: DEFAULT_PAGE_SIZE },
    ],
    queryFn: () =>
      assetsService.list({
        page,
        per_page: DEFAULT_PAGE_SIZE,
        status: status === "ALL" ? undefined : status,
        instance_id: instanceId ?? undefined,
        group_id: groupId ?? undefined,
      }),
  });

  const filtered = useMemo(() => {
    const items = query.data?.items ?? [];
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter(
      (a) =>
        a.ticket_id.toLowerCase().includes(q) ||
        a.asset_type.toLowerCase().includes(q) ||
        (a.serial_number ?? "").toLowerCase().includes(q),
    );
  }, [query.data, debouncedSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        description="All tickets tracked across your workspace."
        actions={<CreateAssetDialog />}
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <WorkspaceSwitcher compact />
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Ticket, type, serial…"
                className="w-full sm:w-72"
              />
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as AssetStatus | "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {query.isLoading ? (
            <DataTableSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No assets found"
              description={
                debouncedSearch || status !== "ALL"
                  ? "Try adjusting your filters or search query."
                  : "Create your first asset to start tracking."
              }
              icon={<Package className="size-5" />}
              action={<CreateAssetDialog />}
            />
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Serial</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Updated</TableHead>
                    <TableHead className="hidden xl:table-cell">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id} className="cursor-pointer">
                      <TableCell className="font-mono font-medium">
                        <Link
                          href={`${ROUTES.ASSETS}/${a.id}`}
                          className="hover:underline"
                        >
                          {a.ticket_id}
                        </Link>
                      </TableCell>
                      <TableCell>{a.asset_type}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {a.serial_number ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={a.status} variant="asset" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDateTime(a.updated_at)}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">
                        {truncateId(a.id)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {query.data && query.data.total > 0 && (
            <Pagination
              page={query.data.page}
              perPage={query.data.per_page}
              total={query.data.total}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
