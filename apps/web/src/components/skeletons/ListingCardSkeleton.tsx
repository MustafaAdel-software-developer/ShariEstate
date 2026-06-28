import { Skeleton } from "@/components/ui/Skeleton";

export function ListingCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-slate-100">
        <Skeleton className="absolute inset-0 rounded-none" />
        <Skeleton className="absolute bottom-3 left-3 h-7 w-28 rounded-lg" />
        <Skeleton className="absolute right-3 top-3 h-9 w-9 rounded-full" />
      </div>
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-4/5" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </article>
  );
}

export function ListingCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
