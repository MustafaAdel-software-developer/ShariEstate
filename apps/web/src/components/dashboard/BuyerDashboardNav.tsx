"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard/saved", label: "Saved homes" },
  { href: "/dashboard/searches", label: "Saved searches" },
  { href: "/dashboard/tours", label: "Tours" },
  { href: "/dashboard/messages", label: "Messages" },
];

export function BuyerDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-px">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "rounded-t-lg px-4 py-2 text-sm font-medium transition",
            pathname === tab.href || pathname.startsWith(`${tab.href}/`)
              ? "border border-b-white border-slate-200 bg-white text-emerald-700 -mb-px"
              : "text-slate-600 hover:text-emerald-600",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
