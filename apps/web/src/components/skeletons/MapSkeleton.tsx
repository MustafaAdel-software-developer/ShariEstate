import { Skeleton } from "@/components/ui/Skeleton";

const MARKER_POSITIONS = [
  "left-[22%] top-[32%]",
  "left-[38%] top-[55%]",
  "left-[54%] top-[28%]",
  "left-[67%] top-[62%]",
  "left-[78%] top-[40%]",
];

export function MapSkeleton() {
  return (
    <div
      className="relative min-h-[400px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 lg:h-[520px]"
      role="status"
      aria-label="Loading map"
    >
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-px bg-slate-200/70">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-full w-full rounded-none bg-slate-200/90" />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-100/20 via-transparent to-slate-300/30" />

      <div className="absolute left-3 top-3 z-10 flex flex-col overflow-hidden rounded-md border border-slate-200/80 bg-white/90 shadow-sm">
        <Skeleton className="h-8 w-8 rounded-none border-b border-slate-200/80" />
        <Skeleton className="h-8 w-8 rounded-none" />
      </div>

      {MARKER_POSITIONS.map((position) => (
        <span
          key={position}
          className={`absolute z-10 flex h-4 w-4 items-center justify-center ${position}`}
        >
          <Skeleton className="h-4 w-4 rounded-full ring-2 ring-white/90" />
        </span>
      ))}

      <Skeleton className="absolute bottom-2 left-2 z-10 h-7 w-64 rounded shadow-sm" />

      <span className="sr-only">Loading map…</span>
    </div>
  );
}
