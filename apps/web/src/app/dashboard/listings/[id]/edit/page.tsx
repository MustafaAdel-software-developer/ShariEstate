"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken, loading } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !accessToken) router.push("/login");
  }, [loading, accessToken, router]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/listings/${id}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      window.location.reload();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Edit Listing</h1>
      <p className="mt-2 text-sm text-slate-600">Listing ID: {id}</p>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <p className="text-sm text-slate-600">Upload listing photos</p>
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="mt-4 text-sm" />
        {uploading && <p className="mt-2 text-sm text-emerald-600">Uploading...</p>}
      </div>

      <button
        type="button"
        onClick={() => api.post(`/listings/${id}/submit`, {}, accessToken!).then(() => router.push("/dashboard"))}
        className="mt-6 w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700"
      >
        Submit for Review
      </button>
    </div>
  );
}
