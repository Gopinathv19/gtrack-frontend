"use client";

import * as React from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
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
