"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth";
import { api, ApiError } from "./api";
import { readFavoritesCache, writeFavoritesCache } from "./session";

interface FavoritesContextValue {
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => Promise<boolean>;
  ready: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

let inflightFetch: Promise<Set<string>> | null = null;
let inflightUserId: string | null = null;

function scheduleIdle(task: () => void) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(task, { timeout: 2000 });
  } else {
    setTimeout(task, 0);
  }
}

async function fetchFavoriteIds(userId: string, token: string): Promise<Set<string>> {
  if (inflightFetch && inflightUserId === userId) {
    return inflightFetch;
  }

  inflightUserId = userId;
  inflightFetch = api
    .get<{ id: string }[]>("/favorites", token)
    .then((list) => {
      const ids = new Set(list.map((l) => l.id));
      writeFavoritesCache(userId, [...ids]);
      return ids;
    })
    .finally(() => {
      inflightFetch = null;
      inflightUserId = null;
    });

  return inflightFetch;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, sessionReady } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const fetchedForUser = useRef<string | null>(null);
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;

  useEffect(() => {
    if (!sessionReady) return;

    if (!user || user.role !== "buyer") {
      setIds(new Set());
      setReady(true);
      fetchedForUser.current = null;
      return;
    }

    const cached = readFavoritesCache(user.id);
    setIds(new Set(cached));
    setReady(true);

    if (fetchedForUser.current === user.id || !accessToken) return;

    fetchedForUser.current = user.id;
    let cancelled = false;

    scheduleIdle(() => {
      if (cancelled || !tokenRef.current) return;
      fetchFavoriteIds(user.id, tokenRef.current)
        .then((next) => {
          if (!cancelled) setIds(next);
        })
        .catch(() => undefined);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionReady, user?.id, user?.role, accessToken]);

  const isFavorite = useCallback((listingId: string) => ids.has(listingId), [ids]);

  const toggleFavorite = useCallback(
    async (listingId: string): Promise<boolean> => {
      if (!accessToken || !user) return false;

      let wasSaved = false;
      setIds((prev) => {
        wasSaved = prev.has(listingId);
        const next = new Set(prev);
        if (wasSaved) next.delete(listingId);
        else next.add(listingId);
        writeFavoritesCache(user.id, [...next]);
        return next;
      });

      try {
        if (wasSaved) {
          await api.delete(`/favorites/${listingId}`, accessToken);
        } else {
          await api.post(`/favorites/${listingId}`, {}, accessToken);
        }
        return true;
      } catch (err) {
        setIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(listingId);
          else next.delete(listingId);
          writeFavoritesCache(user.id, [...next]);
          return next;
        });
        throw err;
      }
    },
    [accessToken, user],
  );

  return (
    <FavoritesContext.Provider value={{ isFavorite, toggleFavorite, ready }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

export { ApiError };
