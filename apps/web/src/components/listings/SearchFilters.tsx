"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSearchNavigation } from "@/lib/useSearchNavigation";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = [
  { value: "", label: "All Types" },
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

interface SearchFiltersProps {
  stateSlug: string;
}

interface Neighborhood {
  id: string;
  name: string;
  slug: string;
}

export function SearchFilters({ stateSlug }: SearchFiltersProps) {
  const searchParams = useSearchParams();
  const { isPending, pushParams } = useSearchNavigation(stateSlug);
  const citySlug = searchParams.get("city") || "";
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

  useEffect(() => {
    if (!citySlug) {
      setNeighborhoods([]);
      return;
    }
    api
      .get<Neighborhood[]>(`/geo/states/${stateSlug}/cities/${citySlug}/neighborhoods`)
      .then(setNeighborhoods)
      .catch(() => setNeighborhoods([]));
  }, [stateSlug, citySlug]);

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "city") params.delete("neighborhood");
    params.delete("page");
    pushParams(params);
  };

  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-slate-200 bg-white p-4 transition-opacity",
        isPending && "opacity-70",
      )}
      aria-busy={isPending}
    >
      <h3 className="font-semibold text-slate-800">Filters</h3>

      <div>
        <label className="text-xs font-medium text-slate-500">Listing Type</label>
        <select
          value={searchParams.get("listingType") || ""}
          onChange={(e) => update("listingType", e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500">Property Type</label>
        <select
          value={searchParams.get("propertyType") || ""}
          onChange={(e) => update("propertyType", e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {citySlug && neighborhoods.length > 0 && (
        <div>
          <label className="text-xs font-medium text-slate-500">Neighborhood</label>
          <select
            value={searchParams.get("neighborhood") || ""}
            onChange={(e) => update("neighborhood", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All neighborhoods</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.slug}>{n.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-slate-500">Min Price</label>
          <input
            type="number"
            defaultValue={searchParams.get("minPrice") || ""}
            onBlur={(e) => update("minPrice", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Max Price</label>
          <input
            type="number"
            defaultValue={searchParams.get("maxPrice") || ""}
            onBlur={(e) => update("maxPrice", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Any"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-slate-500">Beds</label>
          <select
            value={searchParams.get("beds") || ""}
            onChange={(e) => update("beds", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Baths</label>
          <select
            value={searchParams.get("baths") || ""}
            onChange={(e) => update("baths", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500">Sort</label>
        <select
          value={searchParams.get("sort") || "newest"}
          onChange={(e) => update("sort", e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="sqft_desc">Largest</option>
        </select>
      </div>
    </div>
  );
}
