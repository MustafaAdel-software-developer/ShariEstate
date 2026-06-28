"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { ListingCard } from "@/components/listings/ListingCard";
import { RealEstatePageSkeleton } from "@/components/skeletons/RealEstatePageSkeleton";
import type { Listing } from "@real-estate/shared";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role === "buyer") {
      router.replace("/dashboard/saved");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <RealEstatePageSkeleton variant="dashboard" />;
  }

  if (user.role === "buyer") {
    return <RealEstatePageSkeleton variant="dashboard" />;
  }

  return <AgentAdminDashboard />;
}

function AgentAdminDashboard() {
  const { user, accessToken, loading, logout } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [pending, setPending] = useState<Listing[]>([]);
  const [stats, setStats] = useState<{ users: number; listings: number } | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!accessToken || !user) return;

    if (user.role === "agent" || user.role === "seller") {
      api.get<Listing[]>("/listings/mine", accessToken).then(setListings).catch(() => undefined);
    }

    if (user.role === "admin") {
      api.get<Listing[]>("/listings/pending", accessToken).then(setPending).catch(() => undefined);
      api.get<{ users: number; listings: number }>("/admin/stats", accessToken).then(setStats).catch(() => undefined);
    }
  }, [accessToken, user]);

  if (loading || !user) {
    return <RealEstatePageSkeleton variant="dashboard" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-600">Welcome, {user.firstName} ({user.role})</p>
        </div>
        <button onClick={() => logout()} className="text-sm text-slate-500 hover:text-red-600">Sign out</button>
      </div>

      {(user.role === "agent" || user.role === "seller") && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Listings</h2>
            <Link href="/dashboard/listings/new" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              + New Listing
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <div key={l.id}>
                <ListingCard listing={l} />
                <div className="mt-2 flex gap-2">
                  <Link href={`/dashboard/listings/${l.id}/edit`} className="text-sm text-emerald-600 hover:underline">Edit</Link>
                  {l.status === "draft" && (
                    <button
                      type="button"
                      onClick={() => api.post(`/listings/${l.id}/submit`, {}, accessToken!).then(() => window.location.reload())}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Submit for review
                    </button>
                  )}
                  {l.status === "active" && (
                    <button
                      type="button"
                      onClick={async () => {
                        const r = await api.post<{ url?: string }>(`/payments/featured/${l.id}`, {}, accessToken!);
                        if (r.url) window.open(r.url);
                      }}
                      className="text-sm text-amber-600 hover:underline"
                    >
                      Feature listing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {listings.length === 0 && <p className="mt-4 text-slate-500">No listings yet.</p>}
        </div>
      )}

      {user.role === "admin" && (
        <div className="mt-8">
          {stats && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Users</p><p className="text-2xl font-bold">{stats.users}</p></div>
              <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Listings</p><p className="text-2xl font-bold">{stats.listings}</p></div>
              <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Pending Review</p><p className="text-2xl font-bold">{pending.length}</p></div>
            </div>
          )}
          <h2 className="text-lg font-semibold">Pending Listings</h2>
          <div className="mt-4 space-y-4">
            {pending.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border bg-white p-4">
                <div>
                  <p className="font-medium">{l.title}</p>
                  <p className="text-sm text-slate-500">{l.address}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/listing/${l.id}`} className="text-sm text-slate-600 hover:underline">View</Link>
                  <button type="button" onClick={() => api.post(`/listings/${l.id}/approve`, {}, accessToken!).then(() => window.location.reload())} className="rounded bg-emerald-600 px-3 py-1 text-sm text-white">Approve</button>
                  <button type="button" onClick={() => api.post(`/listings/${l.id}/reject`, {}, accessToken!).then(() => window.location.reload())} className="rounded bg-red-100 px-3 py-1 text-sm text-red-700">Reject</button>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/admin/states" className="mt-6 inline-block text-sm font-medium text-emerald-600 hover:underline">
            Manage States →
          </Link>
        </div>
      )}
    </div>
  );
}
