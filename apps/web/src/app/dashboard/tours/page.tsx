"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { BuyerDashboardNav } from "@/components/dashboard/BuyerDashboardNav";
import { RealEstatePageSkeleton } from "@/components/skeletons/RealEstatePageSkeleton";

interface TourRequest {
  id: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  listing?: { id: string; title: string; address: string };
}

export default function ToursPage() {
  const { user, accessToken, loading, logout } = useAuth();
  const router = useRouter();
  const [tours, setTours] = useState<TourRequest[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && user.role !== "buyer") router.push("/dashboard");
  }, [loading, user, router]);

  useEffect(() => {
    if (!accessToken) return;
    api.get<TourRequest[]>("/tours/my-requests", accessToken).then(setTours).catch(() => undefined);
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
        <h2 className="text-lg font-semibold">Tour requests</h2>
        {tours.length === 0 ? (
          <p className="mt-4 text-slate-500">
            No tour requests yet.{" "}
            <Link href="/states/california/search" className="font-medium text-emerald-600 hover:underline">
              Find a home to tour
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {tours.map((tour) => (
              <li key={tour.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {tour.listing && (
                      <Link
                        href={`/listing/${tour.listing.id}`}
                        className="font-medium text-slate-900 hover:text-emerald-600"
                      >
                        {tour.listing.title}
                      </Link>
                    )}
                    <p className="text-sm text-slate-500">{tour.listing?.address}</p>
                    <p className="mt-2 flex items-center gap-1 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(tour.preferredDate).toLocaleDateString()} at {tour.preferredTime}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                    {tour.status.replace("_", " ")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
