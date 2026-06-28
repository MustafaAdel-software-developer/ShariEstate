"use client";

import Link, { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListingLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  label?: string;
}

function PendingOverlay({ label = "Opening property…" }: { label?: string }) {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-hidden />
      <p className="mt-2 text-sm font-semibold text-emerald-700">{label}</p>
    </div>
  );
}

export function ListingLink({ href, className, children, label }: ListingLinkProps) {
  return (
    <Link href={href} prefetch className={cn("relative block", className)}>
      {children}
      <PendingOverlay label={label} />
    </Link>
  );
}

export function InlineListingLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} prefetch className={className}>
      <InlineListingLinkLabel>{children}</InlineListingLinkLabel>
    </Link>
  );
}

function InlineListingLinkLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return <>{pending ? "Loading property…" : children}</>;
}
