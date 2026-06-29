"use client";

import * as React from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Silently refresh the access token whenever the dashboard mounts.
 *
 * Why this exists:
 *   The JWT we hand out at login bakes in the user's `org_id` and
 *   `roles` claims. If the user was *already logged in* when an admin
 *   added them to an organization (via invite-accept on another tab,
 *   or via direct role assignment), their cached access token still
 *   carries the old claims — they'd otherwise see "no organization"
 *   until they signed out and back in. Hitting `/auth/refresh` here
 *   forces the backend to rebuild the token from the latest user row,
 *   so the new org / roles propagate to every subsequent request.
 *
 *   The refresh is best-effort and silent: if it fails (e.g. the
 *   refresh cookie is missing), we leave the existing token in place
 *   and let the normal 401-then-refresh interceptor handle it later.
 */
function useSilentSessionRefresh() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);

  React.useEffect(() => {
    if (!hydrated || !accessToken) return;
    let cancelled = false;
    // Fire-and-forget; setAccessToken inside authService.refresh is
    // already wired through the apiClient interceptor so we don't have
    // to manually plumb it.
    authService
      .refresh()
      .then((pair) => {
        if (!cancelled) {
          useAuthStore.getState().setAccessToken(pair.access_token);
        }
      })
      .catch(() => {
        /* swallow — interceptor will handle real auth failures */
      });
    return () => {
      cancelled = true;
    };
    // Intentionally only run once per mount; we don't want to re-loop
    // when setAccessToken updates the store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);
}

export function DashboardShell({ children }: DashboardShellProps) {
  useSilentSessionRefresh();

  return (
    <div className="flex min-h-svh bg-muted/30">
      <div className="hidden w-60 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-60">
          <Sidebar />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
