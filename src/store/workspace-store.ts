"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WorkspaceState {
  organizationId: string | null;
  instanceId: string | null;
  groupId: string | null;
  setOrganization: (id: string | null) => void;
  setInstance: (id: string | null) => void;
  setGroup: (id: string | null) => void;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      organizationId: null,
      instanceId: null,
      groupId: null,
      setOrganization: (id) =>
        set({ organizationId: id, instanceId: null, groupId: null }),
      setInstance: (id) => set({ instanceId: id, groupId: null }),
      setGroup: (id) => set({ groupId: id }),
      reset: () =>
        set({ organizationId: null, instanceId: null, groupId: null }),
    }),
    {
      name: "gtrack-workspace",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
