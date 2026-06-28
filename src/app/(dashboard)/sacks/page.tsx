"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Boxes } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkspaceSwitcher } from "@/components/shared/workspace-switcher";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton";
import { CreateSackDialog } from "@/components/shared/create-sack-dialog";
import { SearchInput } from "@/components/shared/search-input";
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
import { sacksService } from "@/services/sacks.service";
import { SackStatus } from "@/types";
import { useWorkspace } from "@/hooks/use-workspace";
import { useDebounce } from "@/hooks/use-debounce";
import { DEFAULT_PAGE_SIZE, ROUTES } from "@/constants";
import { formatDateTime, truncateId } from "@/lib/utils";

const STATUSES: { value: SackStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  ...Object.values(SackStatus).map((s) => ({
    value: s,
    label: s.replaceAll("_", " "),
  })),
];

export default function SacksPage() {
  const { groupId } = useWorkspace();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SackStatus | "ALL">("ALL");
  const [ticketSearch, setTicketSearch] = useState("");
  const debouncedTicket = useDebounce(ticketSearch.trim(), 300);

  const query = useQuery({
    queryKey: [
      "sacks",
      {
        page,
        status,
        groupId,
        ticket_id: debouncedTicket || undefined,
        per_page: DEFAULT_PAGE_SIZE,
      },
    ],
    queryFn: () =>
      sacksService.list({
        page,
        per_page: DEFAULT_PAGE_SIZE,
        status: status === "ALL" ? undefined : status,
        group_id: groupId ?? undefined,
        ticket_id: debouncedTicket || undefined,
      }),
  });

  const items = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sacks"
        description="Bundle assets together for movement, pickup, and delivery."
        actions={<CreateSackDialog />}
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <WorkspaceSwitcher compact />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput
                value={ticketSearch}
                onChange={(v) => {
                  setTicketSearch(v);
                  setPage(1);
                }}
                placeholder="Search by ticket ID…"
                className="w-full sm:w-56"
              />
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as SackStatus | "ALL");
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
          ) : items.length === 0 ? (
            <EmptyState
              title="No sacks yet"
              description="Create a sack to bundle assets together for movement."
              icon={<Boxes className="size-5" />}
              action={<CreateSackDialog />}
            />
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sack code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Updated</TableHead>
                    <TableHead className="hidden lg:table-cell">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono font-medium">
                        <Link
                          href={`${ROUTES.SACKS}/${s.id}`}
                          className="hover:underline"
                        >
                          {s.sack_code}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={s.status} variant="sack" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {formatDateTime(s.updated_at)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">
                        {truncateId(s.id)}
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
