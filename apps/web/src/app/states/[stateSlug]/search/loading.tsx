import { Skeleton } from "@/components/ui/Skeleton";
import { SearchResultsPanelSkeleton } from "@/components/skeletons/SearchResultsPanelSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-6 h-11 w-full max-w-2xl rounded-lg" />
      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        <aside className="space-y-4 rounded-xl border border-slate-200 p-4 lg:col-span-1">
          <Skeleton className="h-5 w-16" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </aside>
        <div className="lg:col-span-3">
          <SearchResultsPanelSkeleton />
        </div>
      </div>
    </div>
  );
}
