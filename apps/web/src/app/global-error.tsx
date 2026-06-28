"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RealEstatePageSkeleton } from "@/components/skeletons/RealEstatePageSkeleton";

export default function GlobalError({
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
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-2 text-slate-600">
            The page failed to load. This often happens when the dev server needs a restart.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
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
          <div className="mt-10 text-left">
            <RealEstatePageSkeleton variant="home" />
          </div>
        </div>
      </body>
    </html>
  );
}
