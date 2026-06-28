"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { Home, Search, Users, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { readStoredSession } from "@/lib/session";

export function Header() {
  const { user } = useAuth();
  const [storedFirstName, setStoredFirstName] = useState<string | null>(null);

  useLayoutEffect(() => {
    setStoredFirstName(readStoredSession()?.user?.firstName ?? null);
  }, []);

  const displayName = user?.firstName ?? storedFirstName;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-emerald-700">
          <Home className="h-6 w-6" />
          ShariEstate
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/states/california/search" className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-emerald-700">
            <Search className="h-4 w-4" /> Search
          </Link>
          <Link href="/agents" className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-emerald-700">
            <Users className="h-4 w-4" /> Agents
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-emerald-700">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          {displayName ? (
            <Link
              href="/dashboard"
              className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              {displayName}
            </Link>
          ) : (
            <Link href="/login" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-bold text-emerald-700">ShariEstate</h3>
            <p className="mt-2 text-sm text-slate-600">Your trusted platform for finding homes across the United States.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Browse</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li><Link href="/states/california">California</Link></li>
              <li><Link href="/states/california/search">Search Homes</Link></li>
              <li><Link href="/agents">Find an Agent</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Company</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Legal</h4>
            <p className="mt-2 text-xs text-slate-500">Equal Housing Opportunity. We comply with the Fair Housing Act.</p>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">&copy; {new Date().getFullYear()} ShariEstate. All rights reserved.</p>
      </div>
    </footer>
  );
}
