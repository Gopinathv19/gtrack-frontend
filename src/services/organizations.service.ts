import { apiClient } from "@/lib/api-client";
import type { Group, Instance, Organization, Page } from "@/types";

export const organizationsService = {
  list: (params: { page?: number; per_page?: number } = {}) =>
    apiClient.get<Page<Organization>>("/orgs", { params }).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<Organization>(`/orgs/${id}`).then((r) => r.data),
  create: (payload: { name: string; description?: string }) =>
    apiClient.post<Organization>("/orgs", payload).then((r) => r.data),
  update: (id: string, payload: { name?: string; description?: string }) =>
    apiClient.patch<Organization>(`/orgs/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<void>(`/orgs/${id}`).then(() => undefined),

  // Instances
  listInstances: (orgId: string, params: { page?: number; per_page?: number } = {}) =>
    apiClient
      .get<Page<Instance>>(`/orgs/${orgId}/instances`, { params })
      .then((r) => r.data),
  createInstance: (
    orgId: string,
    payload: { name: string; description?: string },
  ) =>
    apiClient
      .post<Instance>(`/orgs/${orgId}/instances`, payload)
      .then((r) => r.data),
  getInstance: (id: string) =>
    apiClient.get<Instance>(`/instances/${id}`).then((r) => r.data),
  updateInstance: (
    id: string,
    payload: { name?: string; description?: string },
  ) =>
    apiClient.patch<Instance>(`/instances/${id}`, payload).then((r) => r.data),
  deleteInstance: (id: string) =>
    apiClient.delete<void>(`/instances/${id}`).then(() => undefined),

  // Groups
  listGroups: (
    instanceId: string,
    params: { page?: number; per_page?: number } = {},
  ) =>
    apiClient
      .get<Page<Group>>(`/instances/${instanceId}/groups`, { params })
      .then((r) => r.data),
  createGroup: (
    instanceId: string,
    payload: { name: string; description?: string },
  ) =>
    apiClient
      .post<Group>(`/instances/${instanceId}/groups`, payload)
      .then((r) => r.data),
  getGroup: (id: string) =>
    apiClient.get<Group>(`/groups/${id}`).then((r) => r.data),
  updateGroup: (id: string, payload: { name?: string; description?: string }) =>
    apiClient.patch<Group>(`/groups/${id}`, payload).then((r) => r.data),
  deleteGroup: (id: string) =>
    apiClient.delete<void>(`/groups/${id}`).then(() => undefined),
};
