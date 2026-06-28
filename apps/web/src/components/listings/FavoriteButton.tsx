"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useFavorites, ApiError } from "@/lib/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
  variant?: "icon" | "button";
}

export function FavoriteButton({ listingId, className, variant = "icon" }: FavoriteButtonProps) {
  const { accessToken, loading: authLoading } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const saved = isFavorite(listingId);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (authLoading) return;
    if (!accessToken) {
      router.push("/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setBusy(true);
    try {
      await toggleFavorite(listingId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login?next=" + encodeURIComponent(window.location.pathname));
      }
    } finally {
      setBusy(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        data-prevent-nav
        aria-busy={busy}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition",
          saved
            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
            : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-600",
          className,
        )}
      >
        <Heart className={cn("h-4 w-4", saved && "fill-emerald-600")} />
        {saved ? "Saved to favorites" : "Save home"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      aria-busy={busy}
      data-prevent-nav
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-105 disabled:opacity-80",
        className,
      )}
    >
      {busy ? (
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" aria-hidden />
      ) : (
        <Heart
          className={cn("h-5 w-5", saved ? "fill-red-500 text-red-500" : "text-slate-600")}
        />
      )}
    </button>
  );
}
