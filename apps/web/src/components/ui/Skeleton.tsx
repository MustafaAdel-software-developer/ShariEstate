import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-shimmer rounded-md bg-slate-200/80", className)}
      aria-hidden
    />
  );
}
