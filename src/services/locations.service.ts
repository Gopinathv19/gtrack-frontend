import { apiClient } from "@/lib/api-client";
import type { Location, Page } from "@/types";

export interface LocationPayload {
  name: string;
  building?: string;
  floor?: string;
  room?: string;
  description?: string;
}

export const locationsService = {
  list: (params: { group_id?: string; page?: number; per_page?: number } = {}) =>
    apiClient.get<Page<Location>>("/locations", { params }).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<Location>(`/locations/${id}`).then((r) => r.data),
  create: (groupId: string, payload: LocationPayload) =>
    apiClient
      .post<Location>(`/groups/${groupId}/locations`, payload)
      .then((r) => r.data),
  update: (id: string, payload: Partial<LocationPayload>) =>
    apiClient.patch<Location>(`/locations/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<void>(`/locations/${id}`).then(() => undefined),
};
