"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useFavorites } from "@/lib/favorites";
import { ListingCard } from "@/components/listings/ListingCard";
import { BuyerDashboardNav } from "@/components/dashboard/BuyerDashboardNav";
import { RealEstatePageSkeleton } from "@/components/skeletons/RealEstatePageSkeleton";
import type { Listing } from "@real-estate/shared";

export default function SavedHomesPage() {
  const { user, accessToken, loading, logout } = useAuth();
  const { isFavorite, ready: favoritesReady } = useFavorites();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
    else if (user.role !== "buyer") router.push("/dashboard");
  }, [loading, user, router]);

  useEffect(() => {
    if (!accessToken || user?.role !== "buyer") return;
    let cancelled = false;
    setFetching(true);
    api
      .get<Listing[]>("/favorites", accessToken)
      .then((list) => {
        if (!cancelled) setFavorites(list);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, user?.role]);

  const visibleFavorites = favorites.filter((l) => isFavorite(l.id));

  if (loading || !favoritesReady) {
    return <RealEstatePageSkeleton variant="dashboard" />;
  }

  if (!user || user.role !== "buyer") {
    return <RealEstatePageSkeleton variant="dashboard" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-slate-600">Welcome, {user.firstName}</p>
        </div>
        <button onClick={() => logout()} className="text-sm text-slate-500 hover:text-red-600">
          Sign out
        </button>
      </div>

      <BuyerDashboardNav />

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Saved homes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleFavorites.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
        {!fetching && visibleFavorites.length === 0 && (
          <p className="mt-4 text-slate-500">
            No saved homes yet.{" "}
            <Link href="/states/california/search" className="font-medium text-emerald-600 hover:underline">
              Browse listings
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
