import Link from "next/link";
import { api } from "@/lib/api";

export const metadata = { title: "Find an Agent" };
export const revalidate = 60;

export default async function AgentsPage() {
  let agents: {
    id: string;
    slug: string;
    bio?: string;
    phone?: string;
    user: { firstName: string; lastName: string };
    brokerage?: { name: string };
    _count?: { listings: number };
  }[] = [];

  try {
    agents = await api.get("/agents?state=california");
  } catch {
    // API offline
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Find an Agent</h1>
      <p className="mt-2 text-slate-600">Connect with experienced real estate professionals in California.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Link
            key={agent.id}
            href={`/agents/${agent.slug}`}
            className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-emerald-500 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
              {agent.user.firstName[0]}{agent.user.lastName[0]}
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">
              {agent.user.firstName} {agent.user.lastName}
            </h2>
            {agent.brokerage && <p className="text-sm text-slate-500">{agent.brokerage.name}</p>}
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{agent.bio}</p>
            <p className="mt-3 text-sm font-medium text-emerald-600">{agent._count?.listings ?? 0} active listings</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
