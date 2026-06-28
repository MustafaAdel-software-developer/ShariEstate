"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function AdminStatesPage() {
  const { accessToken } = useAuth();
  const [states, setStates] = useState<{ id: string; name: string; slug: string; enabled: boolean }[]>([]);

  useEffect(() => {
    if (accessToken) {
      api.get<typeof states>("/admin/states", accessToken).then(setStates).catch(() => undefined);
    }
  }, [accessToken]);

  const toggle = async (id: string, enabled: boolean) => {
    if (!accessToken) return;
    await api.patch(`/admin/states/${id}/enable`, { enabled: !enabled }, accessToken);
    setStates((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !enabled } : s)));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Manage States</h1>
      <p className="mt-2 text-slate-600">Enable states for multi-state rollout.</p>
      <ul className="mt-8 space-y-2">
        {states.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
            <span>{s.name} ({s.slug})</span>
            <button
              type="button"
              onClick={() => toggle(s.id, s.enabled)}
              className={`rounded px-3 py-1 text-sm font-medium ${s.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
            >
              {s.enabled ? "Enabled" : "Disabled"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
