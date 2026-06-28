"use client";

import Image from "next/image";
import { Bed, Bath, Maximize, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FavoriteButton } from "./FavoriteButton";
import { ListingLink } from "@/components/navigation/ListingLink";
import type { Listing } from "@real-estate/shared";

interface ListingCardProps {
  listing: Listing & { images?: { url: string; isCover?: boolean }[]; city?: { name: string }; state?: { abbreviation: string } };
  showCompare?: boolean;
  isCompared?: boolean;
  onCompare?: (id: string) => void;
  priority?: boolean;
}

export function ListingCard({ listing, showCompare, isCompared, onCompare, priority }: ListingCardProps) {
  const cover = listing.images?.find((i) => i.isCover) || listing.images?.[0];
  const location = [listing.city?.name, listing.state?.abbreviation].filter(Boolean).join(", ");

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <ListingLink href={`/listing/${listing.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {cover ? (
            <Image
              src={cover.url}
              alt={listing.title}
              fill
              priority={priority}
              loading={priority ? undefined : "lazy"}
              className="object-cover transition group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">No photo</div>
          )}
          {listing.isFeatured && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">Featured</span>
          )}
          <FavoriteButton listingId={listing.id} className="absolute right-3 top-3 z-30" />
          <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2 py-1 text-lg font-bold text-slate-900">
            {formatPrice(Number(listing.price), listing.listingType)}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{listing.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" /> {location || listing.address}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {listing.beds}</span>
            <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {Number(listing.baths)}</span>
            {listing.sqft && <span className="flex items-center gap-1"><Maximize className="h-4 w-4" /> {listing.sqft.toLocaleString()} sqft</span>}
          </div>
        </div>
      </ListingLink>
      {showCompare && onCompare && (
        <div className="border-t px-4 py-2">
          <button
            type="button"
            onClick={() => onCompare(listing.id)}
            className={`text-sm font-medium ${isCompared ? "text-emerald-600" : "text-slate-500 hover:text-emerald-600"}`}
          >
            {isCompared ? "✓ Added to compare" : "Compare"}
          </button>
        </div>
      )}
    </article>
  );
}
