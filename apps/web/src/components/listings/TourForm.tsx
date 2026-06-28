"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Props {
  listingId: string;
}

export function TourForm({ listingId }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    try {
      await api.post("/tours", {
        listingId,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone") || undefined,
        preferredDate: form.get("preferredDate"),
        preferredTime: form.get("preferredTime"),
        message: form.get("message") || undefined,
      });
      setStatus("success");
    } catch {
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center text-sm text-blue-700">
        Tour request submitted! The agent will confirm your appointment.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="font-semibold">Schedule a Tour</h3>
      <div className="mt-4 space-y-3">
        <input name="name" required placeholder="Your name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="preferredDate" type="date" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select name="preferredTime" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Preferred time</option>
          <option value="9:00 AM">9:00 AM</option>
          <option value="11:00 AM">11:00 AM</option>
          <option value="1:00 PM">1:00 PM</option>
          <option value="3:00 PM">3:00 PM</option>
          <option value="5:00 PM">5:00 PM</option>
        </select>
      </div>
      <button type="submit" disabled={status === "loading"} className="mt-4 w-full rounded-lg border border-emerald-600 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50">
        Request Tour
      </button>
    </form>
  );
}
