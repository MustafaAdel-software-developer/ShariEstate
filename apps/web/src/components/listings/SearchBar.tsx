"use client";

import { useSearchParams } from "next/navigation";
import { useSearchNavigation } from "@/lib/useSearchNavigation";

interface SearchBarProps {
  stateSlug: string;
  basePath?: string;
}

export function SearchBar({ stateSlug, basePath }: SearchBarProps) {
  const searchParams = useSearchParams();
  const { isPending, pushParams } = useSearchNavigation(stateSlug, basePath);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    const keywords = form.get("keywords") as string;
    if (keywords) params.set("keywords", keywords);
    else params.delete("keywords");
    pushParams(params);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2" aria-busy={isPending}>
      <input
        name="keywords"
        defaultValue={searchParams.get("keywords") || ""}
        placeholder="Search by city, address, or keyword..."
        className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-70"
      >
        {isPending ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
