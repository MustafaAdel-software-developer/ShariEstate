import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ListingCard } from "@/components/listings/ListingCard";
import { SearchBar } from "@/components/listings/SearchBar";
import type { Listing } from "@real-estate/shared";

interface Props {
  params: Promise<{ stateSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stateSlug } = await params;
  try {
    const state = await api.get<{ name: string; seoTitle?: string; seoDescription?: string }>(`/geo/states/${stateSlug}`);
    return {
      title: state.seoTitle || `${state.name} Real Estate`,
      description: state.seoDescription || `Browse homes in ${state.name}`,
    };
  } catch {
    return { title: "State Not Found" };
  }
}

export default async function StatePage({ params }: Props) {
  const { stateSlug } = await params;

  let state: Awaited<ReturnType<typeof api.get>>;
  let featured: Listing[] = [];

  try {
    [state, featured] = await Promise.all([
      api.get(`/geo/states/${stateSlug}`),
      api.get<Listing[]>(`/listings/featured?state=${stateSlug}`),
    ]);
  } catch {
    notFound();
  }

  const s = state as {
    name: string;
    slug: string;
    heroTitle?: string;
    heroSubtitle?: string;
    cities: { id: string; name: string; slug: string; _count?: { listings: number } }[];
    _count?: { listings: number };
  };

  return (
    <div>
      <section className="bg-emerald-700 px-4 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold md:text-4xl">{s.heroTitle || `${s.name} Real Estate`}</h1>
          <p className="mt-3 max-w-2xl text-emerald-100">{s.heroSubtitle}</p>
          <div className="mt-8 max-w-2xl">
            <SearchBar stateSlug={stateSlug} />
          </div>
          <p className="mt-4 text-sm text-emerald-200">{s._count?.listings ?? 0} active listings</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-xl font-bold">Top Cities in {s.name}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.cities.map((city) => (
            <Link
              key={city.id}
              href={`/states/${stateSlug}/${city.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-5 hover:border-emerald-500 hover:shadow-sm"
            >
              <h3 className="font-semibold">{city.name}</h3>
              <p className="text-sm text-slate-500">{city._count?.listings ?? 0} listings</p>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="border-t bg-slate-50 px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Featured in {s.name}</h2>
              <Link href={`/states/${stateSlug}/search`} className="text-sm font-medium text-emerald-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 6).map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
