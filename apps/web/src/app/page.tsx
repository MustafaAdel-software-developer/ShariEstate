import Link from "next/link";
import { api } from "@/lib/api";
import { ListingCard } from "@/components/listings/ListingCard";
import { EMPTY_SEARCH, sanitizeListings } from "@/lib/listings";
import type { Listing, State } from "@real-estate/shared";

export const revalidate = 60;

export default async function HomePage() {
  let states: State[] = [];
  let featured: Listing[] = [];

  try {
    const [statesRes, featuredRes] = await Promise.all([
      api.get<State[]>("/geo/states"),
      api.get<Listing[]>("/listings/featured"),
    ]);
    states = statesRes;
    featured = sanitizeListings({ ...EMPTY_SEARCH, data: featuredRes, total: featuredRes.length }).data;
  } catch {
    // API may be offline during first setup
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Find Your Perfect Home</h1>
          <p className="mt-4 text-lg text-emerald-100">
            Browse thousands of properties for sale and rent across the United States.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {states.slice(0, 1).map((s) => (
              <Link
                key={s.id}
                href={`/states/${s.slug}/search`}
                className="rounded-lg bg-white px-8 py-3 font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Search {s.name}
              </Link>
            ))}
            <Link href="/agents" className="rounded-lg border border-white/40 px-8 py-3 font-semibold hover:bg-white/10">
              Find an Agent
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900">Featured Listings</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} priority={i < 2} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-slate-900">Browse by State</h2>
          <p className="mt-2 text-slate-600">Start with our launch markets, with more states coming soon.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {states.map((state) => (
              <Link
                key={state.id}
                href={`/states/${state.slug}`}
                className="rounded-xl border border-slate-200 p-6 transition hover:border-emerald-500 hover:shadow-md"
              >
                <h3 className="font-semibold text-slate-900">{state.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{state.abbreviation}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
