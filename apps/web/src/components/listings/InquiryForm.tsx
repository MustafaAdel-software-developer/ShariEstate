"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Props {
  listingId: string;
  agentUserId?: string;
}

export function InquiryForm({ listingId }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await api.post("/inquiries", {
        listingId,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone") || undefined,
        message: form.get("message"),
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send inquiry");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-medium text-emerald-700">Message sent!</p>
        <p className="mt-1 text-sm text-emerald-600">An agent will contact you soon.</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-3 text-sm text-emerald-600 underline">Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="font-semibold text-slate-900">Contact Agent</h3>
      <div className="mt-4 space-y-3">
        <input name="name" required placeholder="Your name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="phone" placeholder="Phone (optional)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <textarea name="message" required rows={4} placeholder="I'm interested in this property..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={status === "loading"} className="mt-4 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
