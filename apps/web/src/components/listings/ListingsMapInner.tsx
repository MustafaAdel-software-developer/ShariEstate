"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { InlineListingLink } from "@/components/navigation/ListingLink";
import { Bed, Bath } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

export interface MapListing {
  id: string;
  lat: number;
  lng: number;
  price: number;
  listingType?: string;
  title?: string;
  imageUrl?: string;
  beds?: number;
  baths?: number;
  address?: string;
  cityName?: string;
}

interface ListingsMapProps {
  listings: MapListing[];
  center?: { lat: number; lng: number };
  layoutKey?: string;
}

const DOT_RADIUS = 8;

function MapEffects({ listings, layoutKey }: { listings: MapListing[]; layoutKey?: string }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(timer);
  }, [map, layoutKey]);

  useEffect(() => {
    if (listings.length === 0) return;
    const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 11 });
  }, [map, listings]);

  return null;
}

function ListingTooltipContent({ listing }: { listing: MapListing }) {
  return (
    <div className="w-52 overflow-hidden rounded-lg bg-white shadow-lg">
      {listing.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.imageUrl}
          alt={listing.title || "Property"}
          className="h-28 w-full object-cover"
        />
      ) : (
        <div className="flex h-28 items-center justify-center bg-slate-100 text-xs text-slate-400">
          No photo
        </div>
      )}
      <div className="p-2.5">
        <p className="line-clamp-2 text-xs font-semibold text-slate-900">{listing.title}</p>
        <p className="mt-1 text-sm font-bold text-emerald-700">
          {formatPrice(listing.price, listing.listingType)}
        </p>
        {(listing.beds !== undefined || listing.baths !== undefined) && (
          <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            {listing.beds !== undefined && (
              <span className="inline-flex items-center gap-0.5">
                <Bed className="h-3 w-3" /> {listing.beds}
              </span>
            )}
            {listing.baths !== undefined && (
              <span className="inline-flex items-center gap-0.5">
                <Bath className="h-3 w-3" /> {listing.baths}
              </span>
            )}
          </p>
        )}
        {(listing.cityName || listing.address) && (
          <p className="mt-1 line-clamp-1 text-xs text-slate-400">
            {[listing.address, listing.cityName].filter(Boolean).join(", ")}
          </p>
        )}
        <InlineListingLink
          href={`/listing/${listing.id}`}
          className="shari-listing-details-link mt-2 inline-flex items-center text-xs font-semibold"
        >
          Click dot for details →
        </InlineListingLink>
      </div>
    </div>
  );
}

function ListingDot({ listing }: { listing: MapListing }) {
  return (
    <CircleMarker
      center={[listing.lat, listing.lng]}
      radius={DOT_RADIUS}
      pathOptions={{
        color: "#ffffff",
        weight: 2,
        fillColor: "#059669",
        fillOpacity: 1,
      }}
      eventHandlers={{
        mouseover: (e) => {
          e.target.setStyle({ fillColor: "#047857", weight: 3 });
          e.target.openTooltip();
        },
        mouseout: (e) => {
          e.target.setStyle({ fillColor: "#059669", weight: 2 });
          e.target.closeTooltip();
        },
      }}
    >
      <Tooltip
        direction="top"
        offset={[0, -10]}
        opacity={1}
        className="shari-listing-tooltip"
        sticky
      >
        <ListingTooltipContent listing={listing} />
      </Tooltip>
      <Popup className="shari-listing-popup" minWidth={220}>
        <ListingTooltipContent listing={listing} />
      </Popup>
    </CircleMarker>
  );
}

export function ListingsMapInner({ listings, center, layoutKey }: ListingsMapProps) {
  const validListings = useMemo(
    () =>
      listings.filter(
        (l) =>
          l.lat != null &&
          l.lng != null &&
          !Number.isNaN(l.lat) &&
          !Number.isNaN(l.lng) &&
          Math.abs(l.lat) <= 90 &&
          Math.abs(l.lng) <= 180,
      ),
    [listings],
  );

  const defaultCenter = useMemo(() => {
    if (center) return { lat: center.lat, lng: center.lng, zoom: 10 };
    if (validListings.length) {
      return {
        lat: validListings.reduce((s, l) => s + l.lat, 0) / validListings.length,
        lng: validListings.reduce((s, l) => s + l.lng, 0) / validListings.length,
        zoom: 8,
      };
    }
    return { lat: 36.7783, lng: -119.4179, zoom: 6 };
  }, [center, validListings]);

  if (validListings.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
        No listings with map coordinates in this search.
      </div>
    );
  }

  return (
    <div className="relative min-h-[400px] w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={defaultCenter.zoom}
        scrollWheelZoom
        className="z-0 h-[400px] w-full min-h-[400px] lg:h-[520px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEffects listings={validListings} layoutKey={layoutKey} />
        {validListings.map((l) => (
          <ListingDot key={l.id} listing={l} />
        ))}
      </MapContainer>
      <p className="absolute bottom-2 left-2 z-[1000] rounded bg-white/90 px-2 py-1 text-xs text-slate-600 shadow">
        {validListings.length} {validListings.length === 1 ? "property" : "properties"} on map · hover a dot for preview
      </p>
    </div>
  );
}
