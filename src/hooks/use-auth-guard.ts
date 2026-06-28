"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/store/auth-store";
import { ROUTES } from "@/constants";

/**
 * Redirect the user based on their auth state.
 * `mode = "protected"` => redirect to /login when unauthenticated
 * `mode = "guest"`     => redirect to /dashboard when already authenticated
 */
export function useAuthGuard(mode: "protected" | "guest" = "protected") {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (mode === "protected" && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    } else if (mode === "guest" && isAuthenticated) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [hydrated, isAuthenticated, mode, router]);

  return { isAuthenticated, hydrated };
}
