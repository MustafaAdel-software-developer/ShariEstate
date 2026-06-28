import { Suspense } from "react";
import type { Metadata } from "next";
import { api, buildSearchParams } from "@/lib/api";
import { SearchBar } from "@/components/listings/SearchBar";
import { SearchFilters } from "@/components/listings/SearchFilters";
import { SaveSearchButton } from "@/components/listings/SaveSearchButton";
import { SearchResults } from "./SearchResults";
import { SearchResultsPanelSkeleton } from "@/components/skeletons/SearchResultsPanelSkeleton";
import { EMPTY_SEARCH, sanitizeListings } from "@/lib/listings";
import type { PaginatedResponse, Listing } from "@real-estate/shared";

interface Props {
  params: Promise<{ stateSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stateSlug } = await params;
  return { title: `Search Homes in ${stateSlug.replace(/-/g, " ")}` };
}

function normalizeSearchParams(sp: Record<string, string | string[] | undefined>) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (value === undefined) continue;
    out[key] = Array.isArray(value) ? value[0] : value;
  }
  return out;
}

async function SearchResultsLoader({
  stateSlug,
  sp,
}: {
  stateSlug: string;
  sp: Record<string, string>;
}) {
  const query = buildSearchParams({ ...sp, state: stateSlug });

  let result: PaginatedResponse<Listing> = EMPTY_SEARCH;
  let apiOffline = false;

  try {
    result = sanitizeListings(await api.get<PaginatedResponse<Listing>>(`/listings/search?${query}`));
  } catch {
    apiOffline = true;
  }

  return (
    <>
      {apiOffline && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Could not reach the listings API. Make sure the backend is running on port 3001, then refresh.
        </p>
      )}
      <p className="text-slate-600">{result.total} properties found</p>
      <SearchResults initial={result} stateSlug={stateSlug} searchParams={sp} />
    </>
  );
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { stateSlug } = await params;
  const sp = normalizeSearchParams(await searchParams);
  const queryKey = buildSearchParams({ ...sp, state: stateSlug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold capitalize">{stateSlug.replace(/-/g, " ")} — Search Results</h1>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Suspense fallback={null}>
          <SearchBar stateSlug={stateSlug} />
        </Suspense>
        <Suspense fallback={null}>
          <SaveSearchButton stateSlug={stateSlug} />
        </Suspense>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <Suspense fallback={null}>
            <SearchFilters stateSlug={stateSlug} />
          </Suspense>
        </aside>
        <div className="lg:col-span-3">
          <Suspense key={queryKey} fallback={<SearchResultsPanelSkeleton />}>
            <SearchResultsLoader stateSlug={stateSlug} sp={sp} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
