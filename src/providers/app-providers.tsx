"use client";

import * as React from "react";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <TooltipProvider delayDuration={250}>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="system"
            toastOptions={{ className: "font-sans" }}
          />
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
