"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usersService } from "@/services/users.service";
import { useDebounce } from "@/hooks/use-debounce";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { formatDateTime, getInitials, truncateId } from "@/lib/utils";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);

  const query = useQuery({
    queryKey: ["users", { page, per_page: DEFAULT_PAGE_SIZE }],
    queryFn: () => usersService.list({ page, per_page: DEFAULT_PAGE_SIZE }),
  });

  const items = (query.data?.items ?? []).filter((u) => {
    if (!debounced) return true;
    const q = debounced.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="People with access to your organization."
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name or email…"
            className="w-full sm:w-80"
          />

          {query.isLoading ? (
            <DataTableSkeleton rows={5} />
          ) : items.length === 0 ? (
            <EmptyState
              title="No users found"
              description={
                debounced
                  ? "Try a different search query."
                  : "Invite teammates to start collaborating."
              }
            />
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead className="hidden xl:table-cell">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-7">
                            <AvatarFallback className="text-[10px]">
                              {getInitials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {u.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground md:hidden">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.is_active ? "default" : "secondary"}>
                          {u.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDateTime(u.created_at)}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">
                        {truncateId(u.id)}
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
