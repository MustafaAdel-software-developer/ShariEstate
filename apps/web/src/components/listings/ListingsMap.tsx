"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { MapListing } from "./ListingsMapInner";

interface ListingsMapProps {
  listings: MapListing[];
  center?: { lat: number; lng: number };
  layoutKey?: string;
}

export type { MapListing };

export const ListingsMap = dynamic(
  () => import("./ListingsMapInner").then((m) => m.ListingsMapInner),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative min-h-[400px] w-full rounded-xl border border-slate-200 bg-slate-50 lg:h-[520px]"
        aria-hidden
      />
    ),
  },
) as ComponentType<ListingsMapProps>;
