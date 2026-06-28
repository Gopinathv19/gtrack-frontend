"use client";

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/store/auth-store";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

/**
 * The single axios instance used across the app. It transparently:
 *   - attaches the access token from the auth store
 *   - includes credentials so the HttpOnly refresh cookie is sent
 *   - on 401, attempts a silent refresh and replays the failed request
 *   - on a hard auth failure, clears the auth store
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const res = await axios.post<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>(
      `${BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const token = res.data.access_token;
    useAuthStore.getState().setAccessToken(token);
    return token;
  } catch {
    useAuthStore.getState().clear();
    return null;
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // Skip refresh for the auth endpoints themselves to avoid loops.
    const url = original?.url ?? "";
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      refreshPromise ??= performRefresh().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${newToken}`,
        };
        return apiClient.request(original);
      }
    }

    return Promise.reject(error);
  },
);

/** Pull a clean error message out of an axios error. */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { detail?: unknown; message?: unknown } | undefined;
    const detail = data?.detail ?? data?.message;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
