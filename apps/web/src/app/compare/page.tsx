"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useCompareListings } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Listing } from "@real-estate/shared";

type ListingDetail = Listing & {
  city?: { name: string };
  state?: { abbreviation: string };
};

const COMPARE_ROWS: {
  label: string;
  render: (l: ListingDetail) => string;
}[] = [
  { label: "Price", render: (l) => formatPrice(Number(l.price), l.listingType) },
  { label: "Beds", render: (l) => String(l.beds) },
  { label: "Baths", render: (l) => String(Number(l.baths)) },
  { label: "Sqft", render: (l) => (l.sqft ? l.sqft.toLocaleString() : "—") },
  { label: "Property type", render: (l) => l.propertyType?.replace("_", " ") ?? "—" },
  { label: "Listing type", render: (l) => l.listingType ?? "—" },
  { label: "City", render: (l) => l.city?.name ?? "—" },
  { label: "Year built", render: (l) => (l.yearBuilt ? String(l.yearBuilt) : "—") },
  {
    label: "Features",
    render: (l) => {
      const raw = (l as ListingDetail & { features?: unknown[] }).features;
      if (!raw?.length) return "—";
      return raw
        .map((f) => (typeof f === "string" ? f : (f as { name: string }).name))
        .join(", ");
    },
  },
];

export default function ComparePage() {
  const { compareIds, clear } = useCompareListings();
  const [listings, setListings] = useState<ListingDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareIds.length === 0) {
      setListings([]);
      return;
    }
    setLoading(true);
    Promise.all(compareIds.map((id) => api.get<ListingDetail>(`/listings/${id}`)))
      .then(setListings)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [compareIds]);

  if (compareIds.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <Search className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Compare Listings</h1>
        <p className="mt-2 text-slate-600">
          Add up to 4 listings from search results to compare side by side.
        </p>
        <Link
          href="/states/california/search"
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Browse homes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compare Listings ({listings.length})</h1>
        <button type="button" onClick={clear} className="text-sm text-red-600 hover:underline">
          Clear all
        </button>
      </div>

      {loading && <p className="mt-4 text-slate-500">Loading listings...</p>}

      {!loading && listings.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-3 text-left font-medium text-slate-500"> </th>
                {listings.map((l) => (
                  <th key={l.id} className="px-4 py-3 text-left font-medium text-slate-900">
                    <Link href={`/listing/${l.id}`} className="hover:text-emerald-600 line-clamp-2">
                      {l.title}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.label} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-600">{row.label}</td>
                  {listings.map((l) => (
                    <td key={l.id} className="px-4 py-3 text-slate-800">
                      {row.render(l)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
