"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/shared/status-badge";
import { assetsService } from "@/services/assets.service";
import { sacksService } from "@/services/sacks.service";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCanManageSacks } from "@/hooks/use-permissions";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api-client";
import { AssetStatus, type Sack } from "@/types";

interface AddAssetsToSackDialogProps {
  sack: Sack;
}

/**
 * Lets a sack owner pick CREATED-status assets from the same group and add
 * them to the sack in one POST. After success we surface a toast that
 * summarizes how many were added and how many were skipped (e.g. wrong
 * status, already in a sack) so the user knows immediately what happened.
 */
export function AddAssetsToSackDialog({ sack }: AddAssetsToSackDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search, 250);
  const canManageSacks = useCanManageSacks();
  const { instanceId } = useWorkspace();
  const qc = useQueryClient();

  // Only sacks in the CREATED state can accept new assets — match backend rule.
  const isOpenForChanges = sack.status === "CREATED";

  // Pull assets in the same group that are still CREATED (i.e. addable).
  const assetsQ = useQuery({
    queryKey: [
      "assets",
      "addable",
      { group_id: sack.group_id, instance_id: instanceId },
    ],
    queryFn: () =>
      assetsService.list({
        group_id: sack.group_id,
        instance_id: instanceId ?? undefined,
        status: AssetStatus.CREATED,
        per_page: 100,
      }),
    enabled: open && isOpenForChanges,
  });

  const items = assetsQ.data?.items ?? [];
  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((a) =>
      [a.ticket_id, a.asset_type, a.serial_number ?? ""]
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [items, debouncedSearch]);

  const mutation = useMutation({
    mutationFn: () => sacksService.addAssets(sack.id, Array.from(selected)),
    onSuccess: (result) => {
      const addedCount = result.added.length;
      const skippedCount = result.skipped.length;
      if (addedCount > 0) {
        toast.success(
          `Added ${addedCount} asset${addedCount === 1 ? "" : "s"} to sack`,
          skippedCount > 0
            ? { description: `${skippedCount} skipped — see details.` }
            : undefined,
        );
      } else if (skippedCount > 0) {
        toast.error(
          `No assets added — all ${skippedCount} were skipped.`,
          {
            description: result.skipped
              .slice(0, 3)
              .map((s) => `${s.asset_id.slice(0, 8)}: ${s.reason}`)
              .join("\n"),
          },
        );
      }
      qc.invalidateQueries({ queryKey: ["sack", sack.id] });
      qc.invalidateQueries({ queryKey: ["sack-assets", sack.id] });
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["sack-movements", sack.id] });
      setSelected(new Set());
      setSearch("");
      setOpen(false);
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Could not add assets to sack")),
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a.id)));
    }
  };

  if (!canManageSacks) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!isOpenForChanges}
          title={
            isOpenForChanges
              ? "Add assets to this sack"
              : "Sack must be in CREATED state to add assets"
          }
        >
          <Plus className="size-4" />
          Add assets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add assets to {sack.sack_code}</DialogTitle>
          <DialogDescription>
            Only assets in this sack&apos;s group with status{" "}
            <span className="font-mono">CREATED</span> are eligible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket, type, or serial…"
              className="pl-8"
            />
          </div>

          <div className="rounded-md border">
            <div className="flex items-center justify-between border-b px-3 py-2 text-xs text-muted-foreground">
              <button
                type="button"
                className="font-medium hover:text-foreground"
                onClick={toggleAll}
                disabled={filtered.length === 0}
              >
                {selected.size === filtered.length && filtered.length > 0
                  ? "Clear selection"
                  : `Select all (${filtered.length})`}
              </button>
              <span>
                {selected.size} selected
              </span>
            </div>
            <ScrollArea className="h-64">
              {assetsQ.isLoading ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Loading assets…
                </p>
              ) : filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {items.length === 0
                    ? "No eligible assets in this group."
                    : "No matches for that query."}
                </p>
              ) : (
                <ul className="divide-y">
                  {filtered.map((asset) => {
                    const checked = selected.has(asset.id);
                    return (
                      <li
                        key={asset.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(asset.id)}
                          aria-label={`Select ${asset.ticket_id}`}
                        />
                        <button
                          type="button"
                          onClick={() => toggle(asset.id)}
                          className="flex flex-1 items-center justify-between text-left"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              <span className="font-mono">{asset.ticket_id}</span>
                              <span className="ml-2 text-muted-foreground">
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
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={selected.size === 0 || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Add {selected.size > 0 ? `${selected.size} ` : ""}
            {selected.size === 1 ? "asset" : "assets"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
