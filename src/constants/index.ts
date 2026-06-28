/**
 * Application-wide constants.
 */

export const APP_NAME = "Gtrack";
export const APP_DESCRIPTION =
  "Asset tracking & logistics platform — track every ticket from creation to delivery.";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ACCEPT_INVITE: "/accept-invite",
  ONBOARDING: "/onboarding",
  DASHBOARD: "/dashboard",
  ASSETS: "/assets",
  SACKS: "/sacks",
  LOCATIONS: "/locations",
  USERS: "/users",
  INVITES: "/invites",
  INSTANCES: "/instances",
  GROUPS: "/groups",
  SETTINGS: "/settings",
} as const;

export const ASSET_STATUS_COLORS: Record<string, string> = {
  CREATED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  PACKED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  IN_TRANSIT: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  RECEIVED: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  DAMAGED: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  LOST: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const SACK_STATUS_COLORS: Record<string, string> = {
  CREATED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  PICKED_UP: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  IN_TRANSIT: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  CLOSED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
};

export const INVITE_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  ACCEPTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  REVOKED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  EXPIRED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;
