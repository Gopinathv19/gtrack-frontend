"use client";

import { Loader2 } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hydrated, isAuthenticated } = useAuthGuard("protected");

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="grid min-h-svh place-items-center bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading your workspace…
        </div>
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
