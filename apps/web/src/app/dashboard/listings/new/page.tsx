"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function NewListingPage() {
  const { user, accessToken, loading } = useAuth();
  const router = useRouter();
  const [states, setStates] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user && user.role === "buyer") router.push("/dashboard");
  }, [loading, user, router]);

  useEffect(() => {
    api.get<{ id: string; name: string; slug: string }[]>("/geo/states").then(setStates).catch(() => undefined);
  }, []);

  const loadCities = async (stateSlug: string) => {
    const data = await api.get<{ id: string; name: string }[]>(`/geo/states/${stateSlug}/cities`);
    setCities(data);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);

    try {
      const listing = await api.post<{ id: string }>("/listings", {
        title: form.get("title"),
        description: form.get("description"),
        listingType: form.get("listingType"),
        propertyType: form.get("propertyType"),
        price: Number(form.get("price")),
        beds: Number(form.get("beds")),
        baths: Number(form.get("baths")),
        sqft: Number(form.get("sqft")) || undefined,
        yearBuilt: Number(form.get("yearBuilt")) || undefined,
        address: form.get("address"),
        zip: form.get("zip"),
        stateId: form.get("stateId"),
        cityId: form.get("cityId"),
        lat: Number(form.get("lat")) || undefined,
        lng: Number(form.get("lng")) || undefined,
        features: (form.get("features") as string)?.split(",").map((s) => s.trim()).filter(Boolean),
      }, accessToken);

      router.push(`/dashboard/listings/${listing.id}/edit`);
    } catch {
      setError("Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Create Listing</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input name="title" required placeholder="Listing title" className="w-full rounded-lg border px-4 py-3 text-sm" />
        <textarea name="description" required rows={5} placeholder="Description (min 20 chars)" className="w-full rounded-lg border px-4 py-3 text-sm" />
        <div className="grid grid-cols-2 gap-4">
          <select name="listingType" required className="rounded-lg border px-4 py-3 text-sm">
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
          <select name="propertyType" required className="rounded-lg border px-4 py-3 text-sm">
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input name="price" type="number" required placeholder="Price" className="rounded-lg border px-4 py-3 text-sm" />
          <input name="beds" type="number" required placeholder="Beds" className="rounded-lg border px-4 py-3 text-sm" />
          <input name="baths" type="number" step="0.5" required placeholder="Baths" className="rounded-lg border px-4 py-3 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="sqft" type="number" placeholder="Sqft" className="rounded-lg border px-4 py-3 text-sm" />
          <input name="yearBuilt" type="number" placeholder="Year built" className="rounded-lg border px-4 py-3 text-sm" />
        </div>
        <input name="address" required placeholder="Street address" className="w-full rounded-lg border px-4 py-3 text-sm" />
        <input name="zip" required placeholder="ZIP code" className="w-full rounded-lg border px-4 py-3 text-sm" />
        <div className="grid grid-cols-2 gap-4">
          <select name="stateId" required className="rounded-lg border px-4 py-3 text-sm" onChange={(e) => {
            const state = states.find((s) => s.id === e.target.value);
            if (state) loadCities(state.slug);
          }}>
            <option value="">Select state</option>
            {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select name="cityId" required className="rounded-lg border px-4 py-3 text-sm">
            <option value="">Select city</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="lat" type="number" step="any" placeholder="Latitude (optional)" className="rounded-lg border px-4 py-3 text-sm" />
          <input name="lng" type="number" step="any" placeholder="Longitude (optional)" className="rounded-lg border px-4 py-3 text-sm" />
        </div>
        <input name="features" placeholder="Features (comma-separated)" className="w-full rounded-lg border px-4 py-3 text-sm" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {submitting ? "Creating..." : "Save as Draft"}
        </button>
      </form>
    </div>
  );
}
