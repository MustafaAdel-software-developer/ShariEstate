import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { Bed, Bath, Maximize, Calendar, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { MortgageCalculator } from "@/components/listings/MortgageCalculator";
import { ListingSidebar } from "@/components/listings/ListingSidebar";
import { PriceHistory } from "@/components/listings/PriceHistory";
import { RealEstatePageSkeleton } from "@/components/skeletons/RealEstatePageSkeleton";
import type { Listing } from "@real-estate/shared";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const listing = await api.get<Listing>(`/listings/${id}`);
    const cover = listing.images?.find((i) => i.isCover) || listing.images?.[0];
    return {
      title: listing.title,
      description: listing.description.slice(0, 160),
      openGraph: cover ? { images: [cover.url] } : undefined,
    };
  } catch {
    return { title: "Listing Not Found" };
  }
}

type ListingDetail = Listing & {
  features?: { name: string }[];
  priceHistory?: { price: number; status: string; createdAt: string; note?: string }[];
  openHouses?: { startAt: string; endAt: string; note?: string }[];
  agent?: {
    id: string;
    slug: string;
    phone?: string;
    bio?: string;
    user?: { firstName: string; lastName: string; email: string };
    brokerage?: { name: string };
  };
};

async function ListingDetail({ id }: { id: string }) {
  let listing: ListingDetail;

  try {
    listing = await api.get(`/listings/${id}`);
  } catch {
    notFound();
  }

  const images = listing.images || [];
  const featureNames =
    (listing.features as Array<string | { name: string }> | undefined)?.map((f) =>
      typeof f === "string" ? f : f.name,
    ) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListingGallery images={images} title={listing.title} />

          <div className="mt-8">
            <p className="text-3xl font-bold text-emerald-700">{formatPrice(Number(listing.price), listing.listingType)}</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{listing.title}</h1>
            <p className="mt-1 flex items-center gap-1 text-slate-600">
              <MapPin className="h-4 w-4" /> {listing.address}, {listing.city?.name} {listing.zip}
            </p>
            <div className="mt-4 flex flex-wrap gap-6 text-slate-700">
              <span className="flex items-center gap-2"><Bed className="h-5 w-5" /> {listing.beds} beds</span>
              <span className="flex items-center gap-2"><Bath className="h-5 w-5" /> {Number(listing.baths)} baths</span>
              {listing.sqft && <span className="flex items-center gap-2"><Maximize className="h-5 w-5" /> {listing.sqft.toLocaleString()} sqft</span>}
              {listing.yearBuilt && <span>Built {listing.yearBuilt}</span>}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-600">{listing.description}</p>
          </div>

          {featureNames.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Features</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {featureNames.map((f) => (
                  <li key={f} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{f}</li>
                ))}
              </ul>
            </div>
          )}

          {listing.openHouses && listing.openHouses.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Open Houses</h2>
              <ul className="mt-3 space-y-2">
                {listing.openHouses.map((oh, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(oh.startAt).toLocaleString()} — {new Date(oh.endAt).toLocaleTimeString()}
                    {oh.note && ` (${oh.note})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {listing.priceHistory && listing.priceHistory.length > 0 && (
            <PriceHistory history={listing.priceHistory} listingType={listing.listingType} />
          )}

          {listing.listingType === "sale" && (
            <div className="mt-8">
              <MortgageCalculator price={Number(listing.price)} />
            </div>
          )}
        </div>

        <ListingSidebar listingId={listing.id} title={listing.title} agent={listing.agent} />
      </div>
    </div>
  );
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense fallback={<RealEstatePageSkeleton variant="listing" />}>
      <ListingDetail id={id} />
    </Suspense>
  );
}
