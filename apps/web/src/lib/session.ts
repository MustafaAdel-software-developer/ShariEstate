import type { User } from "@real-estate/shared";

const STORAGE_KEY = "re_auth";

export interface StoredSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function writeStoredSession(session: StoredSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Client-side expiry check only — used to skip unnecessary refresh calls. */
export function isAccessTokenExpired(token: string, bufferSeconds = 120): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { exp?: number };
    if (!payload.exp) return true;
    return payload.exp * 1000 < Date.now() + bufferSeconds * 1000;
  } catch {
    return true;
  }
}

export function favoritesCacheKey(userId: string) {
  return `re_favorites_${userId}`;
}

export function readFavoritesCache(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(favoritesCacheKey(userId));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function writeFavoritesCache(userId: string, ids: string[]) {
  sessionStorage.setItem(favoritesCacheKey(userId), JSON.stringify(ids));
}

export { STORAGE_KEY };
