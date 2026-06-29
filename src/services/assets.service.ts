import { apiClient } from "@/lib/api-client";
import type {
  Asset,
  AssetBulkResult,
  AssetMovement,
  AssetMovementAction,
  AssetStatus,
  Page,
} from "@/types";

export interface ListAssetsParams {
  status?: AssetStatus;
  group_id?: string;
  instance_id?: string;
  asset_type?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface CreateAssetPayload {
  ticket_id: string;
  asset_type: string;
  serial_number?: string;
  description?: string;
  instance_id: string;
  group_id: string;
  current_location_id?: string | null;
  /** Set by the store manager when this ticket needs a return leg. */
  requires_return?: boolean;
}

export interface UpdateAssetPayload {
  asset_type?: string;
  serial_number?: string;
  description?: string;
  current_location_id?: string | null;
  requires_return?: boolean;
  updated_at?: string;
}

export interface BulkCreateAssetsPayload {
  instance_id: string;
  group_id: string;
  tickets: string[];
  asset_type: string;
  requires_return?: boolean;
}

export interface CreateAssetMovementPayload {
  action: AssetMovementAction;
  from_location_id?: string | null;
  to_location_id?: string | null;
  remarks?: string;
}

export const assetsService = {
  list: (params: ListAssetsParams = {}) =>
    apiClient.get<Page<Asset>>("/assets", { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Asset>(`/assets/${id}`).then((r) => r.data),

  create: (payload: CreateAssetPayload) =>
    apiClient.post<Asset>("/assets", payload).then((r) => r.data),

  bulkCreate: (payload: BulkCreateAssetsPayload) =>
    apiClient
      .post<AssetBulkResult>("/assets/bulk", payload)
      .then((r) => r.data),

  update: (id: string, payload: UpdateAssetPayload) =>
    apiClient.patch<Asset>(`/assets/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete<void>(`/assets/${id}`).then(() => undefined),

  createMovement: (assetId: string, payload: CreateAssetMovementPayload) =>
    apiClient
      .post<AssetMovement>(`/assets/${assetId}/movements`, payload)
      .then((r) => r.data),

  listMovements: (assetId: string) =>
    apiClient
      .get<AssetMovement[]>(`/assets/${assetId}/movements`)
      .then((r) => r.data),
};
