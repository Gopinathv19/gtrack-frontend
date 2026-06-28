import { apiClient } from "@/lib/api-client";
import type { TokenPair } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface AcceptInvitePayload {
  token: string;
  name: string;
  password: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<TokenPair>("/auth/login", payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<TokenPair>("/auth/register", payload).then((r) => r.data),

  refresh: () => apiClient.post<TokenPair>("/auth/refresh").then((r) => r.data),

  logout: () => apiClient.post<void>("/auth/logout").then(() => undefined),

  acceptInvite: ({ token, name, password }: AcceptInvitePayload) =>
    apiClient
      .post<TokenPair>(
        `/invites/accept`,
        { name, password },
        { params: { token } },
      )
      .then((r) => r.data),
};
