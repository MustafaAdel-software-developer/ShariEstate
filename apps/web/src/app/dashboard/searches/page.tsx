"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { BuyerDashboardNav } from "@/components/dashboard/BuyerDashboardNav";
import { SavedSearchList } from "@/components/dashboard/SavedSearchList";
import { RealEstatePageSkeleton } from "@/components/skeletons/RealEstatePageSkeleton";
import type { SavedSearchRecord } from "@/lib/savedSearch";

export default function SavedSearchesPage() {
  const { user, accessToken, loading, logout } = useAuth();
  const router = useRouter();
  const [savedSearches, setSavedSearches] = useState<SavedSearchRecord[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && user.role !== "buyer") router.push("/dashboard");
  }, [loading, user, router]);

  const load = () => {
    if (!accessToken) return;
    api
      .get<SavedSearchRecord[]>("/saved-searches", accessToken)
      .then(setSavedSearches)
      .catch(() => undefined);
  };

  useEffect(() => {
    load();
  }, [accessToken]);

  if (loading || !user || user.role !== "buyer") {
    return <RealEstatePageSkeleton variant="dashboard" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-slate-600">Welcome, {user.firstName}</p>
        </div>
        <button onClick={() => logout()} className="text-sm text-slate-500 hover:text-red-600">
          Sign out
        </button>
      </div>

      <BuyerDashboardNav />

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Saved searches</h2>
        {accessToken && (
          <SavedSearchList searches={savedSearches} accessToken={accessToken} onChange={load} />
        )}
      </div>
    </div>
  );
}
