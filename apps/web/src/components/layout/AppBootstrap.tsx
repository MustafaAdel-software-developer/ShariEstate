"use client";

import { useAuth } from "@/lib/auth";
import { AppLoadingSkeleton } from "@/components/skeletons/RealEstatePageSkeleton";

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return <AppLoadingSkeleton />;
  }

  return <>{children}</>;
}
