import { apiClient } from "@/lib/api-client";
import type { Invite, InviteCreatedResponse } from "@/types";

export const invitesService = {
  list: () => apiClient.get<Invite[]>("/invites").then((r) => r.data),

  create: (payload: { email: string; role_id: string; group_id: string }) =>
    apiClient
      .post<InviteCreatedResponse>("/invites", payload)
      .then((r) => r.data),

  resend: (id: string) =>
    apiClient.post<void>(`/invites/${id}/resend`).then(() => undefined),

  revoke: (id: string) =>
    apiClient.delete<void>(`/invites/${id}`).then(() => undefined),
};
