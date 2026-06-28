import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, buildSearchParams } from "@/lib/api";
import { ListingCard } from "@/components/listings/ListingCard";
import type { PaginatedResponse, Listing } from "@real-estate/shared";

interface Props {
  params: Promise<{ stateSlug: string; citySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stateSlug, citySlug } = await params;
  try {
    const city = await api.get<{ name: string; seoTitle?: string; seoDescription?: string }>(
      `/geo/states/${stateSlug}/cities/${citySlug}`,
    );
    return {
      title: city.seoTitle || `${city.name} Real Estate`,
      description: city.seoDescription,
    };
  } catch {
    return { title: "City Not Found" };
  }
}

export default async function CityPage({ params }: Props) {
  const { stateSlug, citySlug } = await params;

  let city: {
    name: string;
    state: { name: string; slug: string };
    neighborhoods?: { name: string; slug: string; _count?: { listings: number } }[];
    _count?: { listings: number };
  };
  let listings: PaginatedResponse<Listing>;

  try {
    [city, listings] = await Promise.all([
      api.get<typeof city>(
        `/geo/states/${stateSlug}/cities/${citySlug}`,
      ),
      api.get<PaginatedResponse<Listing>>(
        `/listings/search?${buildSearchParams({ state: stateSlug, city: citySlug, limit: 24 })}`,
      ),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-sm text-slate-500">
        <Link href={`/states/${stateSlug}`}>{city.state.name}</Link> / {city.name}
      </nav>
      <h1 className="mt-2 text-3xl font-bold">{city.name}, CA Homes</h1>
      <p className="mt-1 text-slate-600">{city._count?.listings ?? listings.total} active listings</p>

      <Link
        href={`/states/${stateSlug}/search?city=${citySlug}`}
        className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:underline"
      >
        Advanced search in {city.name}
      </Link>

      {city.neighborhoods && city.neighborhoods.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Neighborhoods</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {city.neighborhoods.map((n) => (
              <Link
                key={n.slug}
                href={`/states/${stateSlug}/${citySlug}/${n.slug}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
              >
                {n.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.data.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </div>
  );
}
