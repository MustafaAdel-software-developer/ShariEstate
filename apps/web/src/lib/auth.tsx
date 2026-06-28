"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { api, setAuthHandlers } from "./api";
import {
  readStoredSession,
  writeStoredSession,
  clearStoredSession,
  isAccessTokenExpired,
} from "./session";
import type { User } from "@real-estate/shared";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  sessionReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const refreshTokenRef = useRef<string | null>(null);
  refreshTokenRef.current = refreshToken;

  useLayoutEffect(() => {
    const session = readStoredSession();
    if (session) {
      setUser(session.user);
      setAccessToken(session.accessToken);
      setRefreshToken(session.refreshToken);
      refreshTokenRef.current = session.refreshToken;
    }
    setLoading(false);
    setSessionReady(true);
  }, []);

  useEffect(() => {
    if (!sessionReady || !refreshTokenRef.current) return;
    if (accessToken && !isAccessTokenExpired(accessToken)) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
          "/auth/refresh",
          { refreshToken: refreshTokenRef.current },
        );
        if (cancelled) return;
        setUser(data.user);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        refreshTokenRef.current = data.refreshToken;
        writeStoredSession(data);
      } catch {
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          refreshTokenRef.current = null;
          clearStoredSession();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady]);

  useEffect(() => {
    setAuthHandlers({
      getRefreshToken: () => refreshTokenRef.current,
      onTokenRefreshed: (newAccessToken, newRefreshToken) => {
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        refreshTokenRef.current = newRefreshToken;
        const stored = readStoredSession();
        if (stored) {
          writeStoredSession({ ...stored, accessToken: newAccessToken, refreshToken: newRefreshToken });
        }
      },
      onAuthFailure: () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        refreshTokenRef.current = null;
        clearStoredSession();
      },
    });
    return () => setAuthHandlers(null);
  }, []);

  const persist = useCallback((data: { user: User; accessToken: string; refreshToken: string }) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    refreshTokenRef.current = data.refreshToken;
    writeStoredSession(data);
    setSessionReady(true);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      "/auth/login",
      { email, password },
    );
    persist(data);
  };

  const register = async (input: { email: string; password: string; firstName: string; lastName: string; role?: string }) => {
    const data = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      "/auth/register",
      input,
    );
    persist(data);
  };

  const logout = async () => {
    if (refreshTokenRef.current) {
      await api.post("/auth/logout", { refreshToken: refreshTokenRef.current }).catch(() => undefined);
    }
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    refreshTokenRef.current = null;
    clearStoredSession();
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, loading, sessionReady, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useCompareListings() {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("re_compare");
    if (stored) setCompareIds(JSON.parse(stored));
  }, []);

  const toggle = (id: string) => {
    setCompareIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id);
      } else if (prev.length >= 4) {
        next = [...prev.slice(1), id];
      } else {
        next = [...prev, id];
      }
      localStorage.setItem("re_compare", JSON.stringify(next));
      return next;
    });
  };

  const clear = () => {
    setCompareIds([]);
    localStorage.removeItem("re_compare");
  };

  return { compareIds, toggle, clear };
}
