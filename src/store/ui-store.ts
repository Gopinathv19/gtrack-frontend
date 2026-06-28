"use client";

import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  commandOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  setCommandOpen: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  commandOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setCommandOpen: (v) => set({ commandOpen: v }),
}));
