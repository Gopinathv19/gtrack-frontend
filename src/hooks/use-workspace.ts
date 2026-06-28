"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { organizationsService } from "@/services/organizations.service";
import { useAuth } from "@/store/auth-store";
import { useWorkspaceStore } from "@/store/workspace-store";

/**
 * Hook providing the selected (org, instance, group) tuple and the lists used
 * to populate workspace switchers. The first-available defaults are auto-set
 * if the user has not chosen any yet.
 */
export function useWorkspace() {
  const { organizationId: jwtOrgId, isAuthenticated } = useAuth();
  const {
    organizationId,
    instanceId,
    groupId,
    setOrganization,
    setInstance,
    setGroup,
  } = useWorkspaceStore();

  const orgsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationsService.list({ per_page: 50 }),
    enabled: isAuthenticated,
  });

  const effectiveOrgId = organizationId ?? jwtOrgId ?? null;

  const instancesQuery = useQuery({
    queryKey: ["instances", effectiveOrgId],
    queryFn: () => organizationsService.listInstances(effectiveOrgId!, { per_page: 50 }),
    enabled: Boolean(effectiveOrgId),
  });

  const groupsQuery = useQuery({
    queryKey: ["groups", instanceId],
    queryFn: () => organizationsService.listGroups(instanceId!, { per_page: 50 }),
    enabled: Boolean(instanceId),
  });

  // Auto-select defaults when the user hasn't chosen anything yet.
  useEffect(() => {
    if (!organizationId && effectiveOrgId) setOrganization(effectiveOrgId);
  }, [organizationId, effectiveOrgId, setOrganization]);

  useEffect(() => {
    if (!instanceId && instancesQuery.data?.items?.length) {
      setInstance(instancesQuery.data.items[0]!.id);
    }
  }, [instanceId, instancesQuery.data, setInstance]);

  useEffect(() => {
    if (!groupId && groupsQuery.data?.items?.length) {
      setGroup(groupsQuery.data.items[0]!.id);
    }
  }, [groupId, groupsQuery.data, setGroup]);

  return {
    organizationId: effectiveOrgId,
    instanceId,
    groupId,
    organizations: orgsQuery.data?.items ?? [],
    instances: instancesQuery.data?.items ?? [],
    groups: groupsQuery.data?.items ?? [],
    setOrganization,
    setInstance,
    setGroup,
    isLoading:
      orgsQuery.isLoading || instancesQuery.isLoading || groupsQuery.isLoading,
  };
}
