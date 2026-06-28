"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface Props {
  stateSlug: string;
}

export function SaveSearchButton({ stateSlug }: Props) {
  const { user, accessToken } = useAuth();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!user || user.role !== "buyer" || !accessToken) return null;

  const handleSave = async () => {
    const filters = Object.fromEntries(searchParams.entries());
    setBusy(true);
    try {
      await api.post(
        "/saved-searches",
        {
          name: name.trim() || `Search in ${stateSlug.replace(/-/g, " ")}`,
          stateSlug,
          citySlug: filters.city,
          neighborhoodSlug: filters.neighborhood,
          listingType: filters.listingType,
          propertyType: filters.propertyType,
          minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
          maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
          beds: filters.beds ? Number(filters.beds) : undefined,
          baths: filters.baths ? Number(filters.baths) : undefined,
          keywords: filters.keywords,
          emailAlerts,
        },
        accessToken,
      );
      setSaved(true);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  if (saved) {
    return (
      <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
        Search saved!
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setName(`Search in ${stateSlug.replace(/-/g, " ")}`);
          setOpen(true);
        }}
        className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
      >
        Save this search
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Save search</h3>
            <p className="mt-1 text-sm text-slate-500">Run it anytime from your dashboard.</p>
            <label className="mt-4 block text-sm font-medium text-slate-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-slate-300"
              />
              Email me when new listings match
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
