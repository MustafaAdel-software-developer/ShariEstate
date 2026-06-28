"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RealEstatePageSkeleton } from "@/components/skeletons/RealEstatePageSkeleton";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold">Search unavailable</h1>
      <p className="mt-2 text-slate-600">
        Something went wrong loading search results. Try again, or return home.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
        >
          Go home
        </Link>
      </div>
      <div className="mt-8 opacity-60">
        <RealEstatePageSkeleton variant="search" />
      </div>
    </div>
  );
}
