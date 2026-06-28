import { Home, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ListingCardSkeletonGrid } from "./ListingCardSkeleton";

type Variant = "home" | "search" | "listing" | "agents" | "dashboard" | "default";

interface Props {
  variant?: Variant;
}

function HeaderSkeleton() {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="bg-gradient-to-br from-emerald-800/90 to-emerald-950 px-4 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <Home className="h-8 w-8 text-emerald-200/60" />
        </div>
        <Skeleton className="mx-auto mt-6 h-10 w-3/4 max-w-md bg-white/20" />
        <Skeleton className="mx-auto mt-4 h-5 w-full max-w-lg bg-white/15" />
        <div className="mt-8 flex justify-center gap-4">
          <Skeleton className="h-12 w-40 rounded-lg bg-white/20" />
          <Skeleton className="h-12 w-36 rounded-lg bg-white/10" />
        </div>
      </div>
    </section>
  );
}

function AgentCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <Skeleton className="h-14 w-14 rounded-full" />
      <Skeleton className="mt-4 h-5 w-36" />
      <Skeleton className="mt-2 h-4 w-28" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-4/5" />
      <Skeleton className="mt-4 h-4 w-24" />
    </div>
  );
}

function ListingDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-7 w-3/4" />
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-300" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-6">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <div className="rounded-xl border border-slate-200 p-6 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="rounded-xl border border-slate-200 p-6 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-5 w-36" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-t-lg" />
        ))}
      </div>
      <div className="mt-8">
        <Skeleton className="h-6 w-32" />
        <ListingCardSkeletonGrid count={3} />
      </div>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-5 w-36" />
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
          <ListingCardSkeletonGrid count={6} />
        </div>
      </div>
    </div>
  );
}

export function RealEstatePageSkeleton({ variant = "default" }: Props) {
  return (
    <div className="min-h-[calc(100vh-8rem)] animate-in fade-in duration-200">
      {variant === "home" && (
        <>
          <HeroSkeleton />
          <section className="mx-auto max-w-7xl px-4 py-16">
            <Skeleton className="h-7 w-44" />
            <div className="mt-8">
              <ListingCardSkeletonGrid count={6} />
            </div>
          </section>
          <section className="border-t bg-white px-4 py-16">
            <div className="mx-auto max-w-7xl">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="mt-2 h-5 w-72" />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {variant === "search" && <SearchPageSkeleton />}

      {variant === "listing" && <ListingDetailSkeleton />}

      {variant === "agents" && (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-80" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {variant === "dashboard" && <DashboardSkeleton />}

      {variant === "default" && (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-5 w-40" />
          <div className="mt-8">
            <ListingCardSkeletonGrid count={6} />
          </div>
        </div>
      )}
    </div>
  );
}

export function AppLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderSkeleton />
      <RealEstatePageSkeleton variant="home" />
    </div>
  );
}
