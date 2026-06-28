"use client";

import { useAuth } from "@/store/auth-store";
import { RoleName } from "@/types";

/**
 * Permission helpers backed by the JWT `roles` claim.
 *
 * The role list is populated server-side at login/refresh time. These
 * helpers are UX gates only — mutating endpoints still enforce role
 * checks on the backend via `require_roles(...)`.
 */

function useRoles(): string[] {
  const { roles } = useAuth();
  return roles;
}

export function useHasRole(...allowed: RoleName[]): boolean {
  const roles = useRoles();
  return allowed.some((r) => roles.includes(r));
}

export function useIsOrgAdmin(): boolean {
  return useHasRole(RoleName.ORG_ADMIN);
}

/** Can create/update sacks and pack/unpack assets: ORG_ADMIN or STORE_MAINTAINER. */
export function useCanManageSacks(): boolean {
  return useHasRole(RoleName.ORG_ADMIN, RoleName.STORE_MAINTAINER);
}

/** Can pick up and deliver sacks: SHIFT_PERSON or ORG_ADMIN. */
export function useCanShiftSacks(): boolean {
  return useHasRole(RoleName.SHIFT_PERSON, RoleName.ORG_ADMIN);
}

/** Can mark a delivered sack as RECEIVED: SYSADMIN or ORG_ADMIN. */
export function useCanReceiveSacks(): boolean {
  return useHasRole(RoleName.SYSADMIN, RoleName.ORG_ADMIN);
}
