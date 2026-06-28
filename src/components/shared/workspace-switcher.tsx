"use client";

import { Building2, Layers, MapPin } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspace } from "@/hooks/use-workspace";

/**
 * Three linked dropdowns: Organization → Instance → Group.
 * They drive which records are listed/created across the app.
 */
export function WorkspaceSwitcher({ compact = false }: { compact?: boolean }) {
  const {
    organizationId,
    instanceId,
    groupId,
    organizations,
    instances,
    groups,
    setOrganization,
    setInstance,
    setGroup,
  } = useWorkspace();

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-2"
          : "grid grid-cols-1 gap-2 sm:grid-cols-3"
      }
    >
      <Select
        value={organizationId ?? undefined}
        onValueChange={(v) => setOrganization(v)}
      >
        <SelectTrigger className="h-9 w-full sm:w-[180px]" aria-label="Organization">
          <Building2 className="size-4 text-muted-foreground" />
          <SelectValue placeholder="Organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={instanceId ?? undefined}
        onValueChange={(v) => setInstance(v)}
        disabled={!organizationId || instances.length === 0}
      >
        <SelectTrigger className="h-9 w-full sm:w-[180px]" aria-label="Instance">
          <Layers className="size-4 text-muted-foreground" />
          <SelectValue placeholder="Instance" />
        </SelectTrigger>
        <SelectContent>
          {instances.map((i) => (
            <SelectItem key={i.id} value={i.id}>
              {i.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={groupId ?? undefined}
        onValueChange={(v) => setGroup(v)}
        disabled={!instanceId || groups.length === 0}
      >
        <SelectTrigger className="h-9 w-full sm:w-[180px]" aria-label="Group">
          <MapPin className="size-4 text-muted-foreground" />
          <SelectValue placeholder="Group" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((g) => (
            <SelectItem key={g.id} value={g.id}>
              {g.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
