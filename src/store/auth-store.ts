"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { JwtPayload } from "@/types";

interface AuthState {
  accessToken: string | null;
  payload: JwtPayload | null;
  hydrated: boolean;
  setAccessToken: (token: string | null) => void;
  setHydrated: (v: boolean) => void;
  clear: () => void;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      payload: null,
      hydrated: false,
      setAccessToken: (token) =>
        set({
          accessToken: token,
          payload: token ? decodeJwt(token) : null,
        }),
      setHydrated: (v) => set({ hydrated: v }),
      clear: () => set({ accessToken: null, payload: null }),
    }),
    {
      name: "gtrack-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.accessToken) {
            state.payload = decodeJwt(state.accessToken);
          }
          state.hydrated = true;
        }
      },
    },
  ),
);

/** Convenience selector hook. */
export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const payload = useAuthStore((s) => s.payload);
  const hydrated = useAuthStore((s) => s.hydrated);
  return {
    accessToken,
    payload,
    hydrated,
    isAuthenticated: Boolean(accessToken),
    roles: payload?.roles ?? [],
    organizationId: payload?.org_id ?? null,
    userId: payload?.sub ?? null,
    email: payload?.email ?? null,
  };
}
