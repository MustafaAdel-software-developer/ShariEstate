"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, BellOff, Pencil, Play, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { buildSavedSearchUrl, type SavedSearchRecord } from "@/lib/savedSearch";

interface Props {
  searches: SavedSearchRecord[];
  accessToken: string;
  onChange: () => void;
}

export function SavedSearchList({ searches, accessToken, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startEdit = (search: SavedSearchRecord) => {
    setEditingId(search.id);
    setEditName(search.name);
  };

  const saveName = async (id: string) => {
    if (!editName.trim()) return;
    await api.patch(`/saved-searches/${id}`, { name: editName.trim() }, accessToken);
    setEditingId(null);
    onChange();
  };

  const remove = async (id: string) => {
    await api.delete(`/saved-searches/${id}`, accessToken);
    onChange();
  };

  const toggleAlerts = async (search: SavedSearchRecord) => {
    await api.patch(
      `/saved-searches/${search.id}`,
      { emailAlerts: !search.emailAlerts },
      accessToken,
    );
    onChange();
  };

  if (searches.length === 0) {
    return (
      <p className="mt-4 text-slate-500">
        No saved searches yet.{" "}
        <Link href="/states/california/search" className="font-medium text-emerald-600 hover:underline">
          Start searching
        </Link>
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {searches.map((search) => {
        const stateSlug = (search.filters.stateSlug as string) || "california";
        const runUrl = buildSavedSearchUrl(stateSlug, search.filters);

        return (
          <li
            key={search.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              {editingId === search.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => saveName(search.id)}
                    className="text-sm font-medium text-emerald-600 hover:underline"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-sm text-slate-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <p className="font-medium text-slate-900">{search.name}</p>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                      search.emailAlerts !== false
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {search.emailAlerts !== false ? (
                      <>
                        <Bell className="h-3 w-3" /> Alerts on
                      </>
                    ) : (
                      <>
                        <BellOff className="h-3 w-3" /> Alerts off
                      </>
                    )}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={runUrl}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Play className="h-3.5 w-3.5" /> Run
              </Link>
              <button
                type="button"
                onClick={() => toggleAlerts(search)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                title={search.emailAlerts !== false ? "Turn off email alerts" : "Turn on email alerts"}
              >
                {search.emailAlerts !== false ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => startEdit(search)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(search.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
