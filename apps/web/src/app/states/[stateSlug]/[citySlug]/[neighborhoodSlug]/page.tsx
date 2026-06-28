import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, buildSearchParams } from "@/lib/api";
import { ListingCard } from "@/components/listings/ListingCard";
import type { PaginatedResponse, Listing } from "@real-estate/shared";

interface Props {
  params: Promise<{ stateSlug: string; citySlug: string; neighborhoodSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stateSlug, citySlug, neighborhoodSlug } = await params;
  try {
    const neighborhood = await api.get<{ name: string }>(
      `/geo/states/${stateSlug}/cities/${citySlug}/neighborhoods/${neighborhoodSlug}`,
    );
    return {
      title: `${neighborhood.name} Real Estate`,
      description: `Browse homes in ${neighborhood.name}.`,
    };
  } catch {
    return { title: "Neighborhood Not Found" };
  }
}

export default async function NeighborhoodPage({ params }: Props) {
  const { stateSlug, citySlug, neighborhoodSlug } = await params;

  let neighborhood: {
    name: string;
    slug: string;
    city: { name: string; slug: string; state: { name: string; slug: string } };
    _count?: { listings: number };
  };
  let listings: PaginatedResponse<Listing>;

  try {
    [neighborhood, listings] = await Promise.all([
      api.get<typeof neighborhood>(
        `/geo/states/${stateSlug}/cities/${citySlug}/neighborhoods/${neighborhoodSlug}`,
      ),
      api.get<PaginatedResponse<Listing>>(
        `/listings/search?${buildSearchParams({
          state: stateSlug,
          city: citySlug,
          neighborhood: neighborhoodSlug,
          limit: 24,
        })}`,
      ),
    ]);
  } catch {
    notFound();
  }

  const { city } = neighborhood;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-sm text-slate-500">
        <Link href={`/states/${stateSlug}`}>{city.state.name}</Link>
        {" / "}
        <Link href={`/states/${stateSlug}/${citySlug}`}>{city.name}</Link>
        {" / "}
        {neighborhood.name}
      </nav>
      <h1 className="mt-2 text-3xl font-bold">{neighborhood.name}</h1>
      <p className="mt-1 text-slate-600">
        {city.name}, CA · {neighborhood._count?.listings ?? listings.total} active listings
      </p>

      <Link
        href={`/states/${stateSlug}/search?city=${citySlug}&neighborhood=${neighborhoodSlug}`}
        className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:underline"
      >
        Advanced search in {neighborhood.name}
      </Link>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.data.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
      {listings.data.length === 0 && (
        <p className="mt-8 text-slate-500">No listings in this neighborhood yet.</p>
      )}
    </div>
  );
}
