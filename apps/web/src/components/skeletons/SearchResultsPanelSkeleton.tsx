import { Skeleton } from "@/components/ui/Skeleton";
import { ListingCardSkeleton } from "./ListingCardSkeleton";
import { MapSkeleton } from "./MapSkeleton";

export function SearchResultsPanelSkeleton() {
  return (
    <div className="animate-in fade-in duration-200" role="status" aria-label="Loading search results">
      <Skeleton className="h-5 w-44" />

      <div className="mb-4 mt-4 flex gap-2">
        <Skeleton className="h-8 w-14 rounded-lg" />
        <Skeleton className="h-8 w-14 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
        <MapSkeleton />
      </div>

      <span className="sr-only">Updating search results…</span>
    </div>
  );
}
