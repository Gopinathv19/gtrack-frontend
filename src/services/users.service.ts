import { apiClient } from "@/lib/api-client";
import type { Page, Role, User, UserRoleRecord } from "@/types";

export interface ListUsersParams {
  page?: number;
  per_page?: number;
}

export interface CreateUserPayload {
  email: string;
  name: string;
  phone?: string | null;
  password?: string;
  organization_id: string;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  is_active?: boolean;
}

export const usersService = {
  list: (params: ListUsersParams = {}) =>
    apiClient.get<Page<User>>("/users", { params }).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<User>(`/users/${id}`).then((r) => r.data),
  create: (payload: CreateUserPayload) =>
    apiClient.post<User>("/users", payload).then((r) => r.data),
  update: (id: string, payload: UpdateUserPayload) =>
    apiClient.patch<User>(`/users/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<void>(`/users/${id}`).then(() => undefined),

  // Roles
  listRoles: () => apiClient.get<Role[]>("/roles").then((r) => r.data),

  // Group memberships
  assignToGroup: (groupId: string, payload: { user_id: string; role_id: string }) =>
    apiClient
      .post<UserRoleRecord>(`/groups/${groupId}/users`, payload)
      .then((r) => r.data),

  removeFromGroup: (groupId: string, userId: string) =>
    apiClient
      .delete<void>(`/groups/${groupId}/users/${userId}`)
      .then(() => undefined),

  listGroupUserRoles: (groupId: string) =>
    apiClient
      .get<UserRoleRecord[]>(`/groups/${groupId}/user_roles`)
      .then((r) => r.data),
};
