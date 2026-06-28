"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingsMap } from "@/components/listings/ListingsMap";
import { useCompareListings } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { PaginatedResponse, Listing } from "@real-estate/shared";

interface Props {
  initial: PaginatedResponse<Listing>;
  stateSlug: string;
  searchParams: Record<string, string>;
}

export function SearchResults({ initial, stateSlug, searchParams }: Props) {
  const { compareIds, toggle } = useCompareListings();
  const [view, setView] = useState<"list" | "map" | "split">("split");

  useEffect(() => {
    void import("@/components/listings/ListingsMapInner");
  }, []);

  const mapListings = useMemo(
    () =>
      initial.data
        .filter((l) => l.lat != null && l.lng != null)
        .map((l) => ({
          id: l.id,
          lat: Number(l.lat),
          lng: Number(l.lng),
          price: Number(l.price),
          listingType: l.listingType,
          title: l.title,
          imageUrl: l.images?.find((i) => i.isCover)?.url || l.images?.[0]?.url,
          beds: l.beds,
          baths: Number(l.baths),
          address: l.address,
          cityName: l.city?.name,
        })),
    [initial.data],
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {(["list", "map", "split"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${view === v ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {v}
            </button>
          ))}
        </div>
        {compareIds.length > 0 && (
          <Link href="/compare" className="text-sm font-medium text-emerald-600 hover:underline">
            Compare ({compareIds.length})
          </Link>
        )}
      </div>

      <div className={view === "split" ? "grid gap-6 lg:grid-cols-2" : ""}>
        <div
          className={cn(
            "grid gap-4 sm:grid-cols-2",
            view === "map" && "hidden",
          )}
        >
          {initial.data.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              showCompare
              isCompared={compareIds.includes(listing.id)}
              onCompare={toggle}
            />
          ))}
        </div>
        <div
          className={cn(
            view === "list" && "hidden",
            view === "map" ? "w-full" : "min-w-0",
          )}
        >
          <ListingsMap layoutKey={view} listings={mapListings} />
        </div>
      </div>

      {initial.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: initial.totalPages }, (_, i) => i + 1).slice(0, 10).map((p) => (
            <Link
              key={p}
              href={`/states/${stateSlug}/search?${new URLSearchParams({ ...searchParams, page: String(p) }).toString()}`}
              className={`rounded px-3 py-1 text-sm ${Number(searchParams.page) === p || (!searchParams.page && p === 1) ? "bg-emerald-600 text-white" : "bg-slate-100"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
