const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type AuthHandlers = {
  getRefreshToken: () => string | null;
  onTokenRefreshed: (accessToken: string, refreshToken: string) => void;
  onAuthFailure: () => void;
};

let authHandlers: AuthHandlers | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAuthHandlers(handlers: AuthHandlers | null) {
  authHandlers = handlers;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!authHandlers) return null;
  const refreshToken = authHandlers.getRefreshToken();
  if (!refreshToken) return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });

      if (!res.ok) {
        authHandlers?.onAuthFailure();
        return null;
      }

      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      authHandlers?.onTokenRefreshed(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch {
      authHandlers?.onAuthFailure();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string; _retried?: boolean } = {},
): Promise<T> {
  const { token, _retried, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });

  if (res.status === 401 && token && authHandlers && !_retried && !path.startsWith("/auth/")) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, { ...options, token: newToken, _retried: true });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string, token?: string) => request<T>(path, { token }),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), token }),
  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body), token }),
  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: "DELETE", token }),
};

export function buildSearchParams(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  return sp.toString();
}
