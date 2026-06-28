import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Listing } from "@real-estate/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const agent = await api.get<{ user: { firstName: string; lastName: string } }>(`/agents/${slug}`);
    return { title: `${agent.user.firstName} ${agent.user.lastName} — Agent Profile` };
  } catch {
    return { title: "Agent Not Found" };
  }
}

export default async function AgentProfilePage({ params }: Props) {
  const { slug } = await params;

  let agent: {
    slug: string;
    bio?: string;
    phone?: string;
    licenseNumber?: string;
    user: { firstName: string; lastName: string; email: string };
    brokerage?: { name: string; website?: string };
    listings: Listing[];
  };

  try {
    agent = await api.get(`/agents/${slug}`);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
          {agent.user.firstName[0]}{agent.user.lastName[0]}
        </div>
        <h1 className="mt-4 text-3xl font-bold">{agent.user.firstName} {agent.user.lastName}</h1>
        {agent.brokerage && <p className="text-slate-600">{agent.brokerage.name}</p>}
        {agent.licenseNumber && <p className="mt-1 text-sm text-slate-500">License: {agent.licenseNumber}</p>}
        {agent.phone && <p className="mt-2">{agent.phone}</p>}
        {agent.bio && <p className="mt-4 max-w-2xl text-slate-600">{agent.bio}</p>}
      </div>

      <h2 className="mt-12 text-xl font-bold">Active Listings</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agent.listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
      {agent.listings.length === 0 && (
        <p className="mt-4 text-slate-500">No active listings at this time.</p>
      )}
    </div>
  );
}
