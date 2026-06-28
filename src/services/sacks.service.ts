import { apiClient } from "@/lib/api-client";
import type {
  Asset,
  Page,
  Sack,
  SackAssetsAddResult,
  SackMovement,
  SackStatus,
} from "@/types";

export interface ListSacksParams {
  status?: SackStatus;
  group_id?: string;
  ticket_id?: string;
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
  create: (payload: {
    sack_code: string;
    group_id: string;
    origin_location_id?: string | null;
    destination_location_id?: string | null;
  }) => apiClient.post<Sack>("/sacks", payload).then((r) => r.data),
  update: (id: string, payload: { sack_code?: string }) =>
    apiClient.patch<Sack>(`/sacks/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<void>(`/sacks/${id}`).then(() => undefined),

  /**
   * Change a sack's source / origin location.
   * Backed by `PATCH /sacks/{id}/origin` — restricted to ORG_ADMIN /
   * STORE_MAINTAINER on the server, and allowed while the sack is in transit.
   */
  updateOrigin: (
    id: string,
    payload: {
      origin_location_id?: string | null;
      remarks?: string;
    },
  ) =>
    apiClient.patch<Sack>(`/sacks/${id}/origin`, payload).then((r) => r.data),

  /**
   * Change a sack's intended drop-off location.
   * Backed by `PATCH /sacks/{id}/destination` — restricted to ORG_ADMIN /
   * STORE_MAINTAINER on the server, and allowed while the sack is in transit.
   */
  updateDestination: (
    id: string,
    payload: {
      destination_location_id?: string | null;
      remarks?: string;
    },
  ) =>
    apiClient
      .patch<Sack>(`/sacks/${id}/destination`, payload)
      .then((r) => r.data),

  listAssets: (id: string) =>
    apiClient.get<Asset[]>(`/sacks/${id}/assets`).then((r) => r.data),
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
  receive: (id: string, payload: SackActionPayload) =>
    apiClient.put<Sack>(`/sacks/${id}/receive`, payload).then((r) => r.data),

  listMovements: (id: string) =>
    apiClient.get<SackMovement[]>(`/sacks/${id}/movements`).then((r) => r.data),
};
