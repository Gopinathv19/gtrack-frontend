import { apiClient } from "@/lib/api-client";
import type {
  Page,
  Sack,
  SackAssetsAddResult,
  SackMovement,
  SackStatus,
} from "@/types";

export interface ListSacksParams {
  status?: SackStatus;
  group_id?: string;
  page?: number;
  per_page?: number;
}

export interface SackActionPayload {
  from_location_id?: string | null;
  to_location_id?: string | null;
  remarks?: string;
}

export const sacksService = {
  list: (params: ListSacksParams = {}) =>
    apiClient.get<Page<Sack>>("/sacks", { params }).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<Sack>(`/sacks/${id}`).then((r) => r.data),
  create: (payload: { sack_code: string; group_id: string }) =>
    apiClient.post<Sack>("/sacks", payload).then((r) => r.data),
  update: (id: string, payload: { sack_code?: string }) =>
    apiClient.patch<Sack>(`/sacks/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<void>(`/sacks/${id}`).then(() => undefined),

  addAssets: (id: string, asset_ids: string[]) =>
    apiClient
      .post<SackAssetsAddResult>(`/sacks/${id}/assets`, { asset_ids })
      .then((r) => r.data),
  removeAsset: (sackId: string, assetId: string) =>
    apiClient
      .delete<void>(`/sacks/${sackId}/assets/${assetId}`)
      .then(() => undefined),

  pickup: (id: string, payload: SackActionPayload) =>
    apiClient.put<Sack>(`/sacks/${id}/pickup`, payload).then((r) => r.data),
  deliver: (id: string, payload: SackActionPayload) =>
    apiClient.put<Sack>(`/sacks/${id}/deliver`, payload).then((r) => r.data),
  close: (id: string, payload: SackActionPayload) =>
    apiClient.put<Sack>(`/sacks/${id}/close`, payload).then((r) => r.data),

  listMovements: (id: string) =>
    apiClient.get<SackMovement[]>(`/sacks/${id}/movements`).then((r) => r.data),
};
