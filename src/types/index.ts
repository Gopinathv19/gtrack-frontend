/**
 * Shared TypeScript types mirroring the backend Pydantic schemas.
 */

// ---------- Enums ----------
export const AssetStatus = {
  CREATED: "CREATED",
  PACKED: "PACKED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  RECEIVED: "RECEIVED",
  DAMAGED: "DAMAGED",
  LOST: "LOST",
} as const;
export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus];

export const SackStatus = {
  CREATED: "CREATED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  RECEIVED: "RECEIVED",
} as const;
export type SackStatus = (typeof SackStatus)[keyof typeof SackStatus];

export const AssetMovementAction = {
  CREATED: "CREATED",
  PACKED: "PACKED",
  UNPACKED: "UNPACKED",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  RECEIVED: "RECEIVED",
  DAMAGED: "DAMAGED",
  LOST: "LOST",
} as const;
export type AssetMovementAction =
  (typeof AssetMovementAction)[keyof typeof AssetMovementAction];

export const SackMovementAction = {
  CREATED: "CREATED",
  PICKED_UP: "PICKED_UP",
  DELIVERED: "DELIVERED",
  RECEIVED: "RECEIVED",
} as const;
export type SackMovementAction =
  (typeof SackMovementAction)[keyof typeof SackMovementAction];

export const InviteStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REVOKED: "REVOKED",
  EXPIRED: "EXPIRED",
} as const;
export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];

export const RoleName = {
  ORG_ADMIN: "ORG_ADMIN",
  STORE_MAINTAINER: "STORE_MAINTAINER",
  SHIFT_PERSON: "SHIFT_PERSON",
  SYSADMIN: "SYSADMIN",
  AUDITOR: "AUDITOR",
} as const;
export type RoleName = (typeof RoleName)[keyof typeof RoleName];

// ---------- Common ----------
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface TokenPair {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ---------- User & roles ----------
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  organization_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role_id: string;
  group_id: string;
}

// ---------- Organization / Instance / Group ----------
export interface Organization {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Instance {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  instance_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- Location ----------
export interface Location {
  id: string;
  group_id: string;
  name: string;
  building?: string | null;
  floor?: string | null;
  room?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- Asset ----------
export interface Asset {
  id: string;
  ticket_id: string;
  asset_type: string;
  serial_number?: string | null;
  description?: string | null;
  organization_id: string;
  instance_id: string;
  group_id: string;
  current_location_id?: string | null;
  status: AssetStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssetMovement {
  id: string;
  asset_id: string;
  sack_id?: string | null;
  action: AssetMovementAction;
  performed_by: string;
  from_location_id?: string | null;
  to_location_id?: string | null;
  remarks?: string | null;
  created_at: string;
}

export interface AssetBulkResult {
  created: Asset[];
  failed: { ticket_id: string; error: string }[];
}

// ---------- Sack ----------
export interface Sack {
  id: string;
  sack_code: string;
  organization_id: string;
  group_id: string;
  status: SackStatus;
  created_by: string;
  /** Source / origin location assigned by the store. */
  origin_location_id?: string | null;
  origin_location_name?: string | null;
  /** Intended drop-off location assigned by the store. */
  destination_location_id?: string | null;
  destination_location_name?: string | null;
  created_by_name?: string | null;
  created_by_email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SackMovement {
  id: string;
  sack_id: string;
  action: SackMovementAction;
  performed_by: string;
  performed_by_name?: string | null;
  performed_by_email?: string | null;
  from_location_id?: string | null;
  from_location_name?: string | null;
  to_location_id?: string | null;
  to_location_name?: string | null;
  remarks?: string | null;
  created_at: string;
}

export interface SackAssetsAddResult {
  sack_id: string;
  added: string[];
  skipped: { asset_id: string; reason: string }[];
}

// ---------- Invite ----------
export interface Invite {
  id: string;
  email: string;
  organization_id: string;
  group_id: string;
  role_id: string;
  status: InviteStatus;
  expires_at: string;
  accepted_at?: string | null;
  created_at: string;
}

export interface InviteCreatedResponse {
  invite_id: string;
  token: string;
  accept_url: string;
}

// ---------- JWT payload ----------
export interface JwtPayload {
  sub: string;
  org_id: string | null;
  email: string | null;
  roles: string[];
  exp: number;
  iss?: string;
  aud?: string;
}
