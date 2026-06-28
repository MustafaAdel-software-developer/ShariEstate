"use client";

import Link from "next/link";
import { FavoriteButton } from "./FavoriteButton";
import { ShareListingButton } from "./ShareListingButton";
import { InquiryForm } from "./InquiryForm";
import { TourForm } from "./TourForm";

interface Props {
  listingId: string;
  title: string;
  agent?: {
    id: string;
    slug: string;
    phone?: string;
    user?: { firstName: string; lastName: string };
    brokerage?: { name: string };
  };
}

export function ListingSidebar({ listingId, title, agent }: Props) {
  return (
    <div className="space-y-4 lg:sticky lg:top-20">
      <FavoriteButton listingId={listingId} variant="button" />
      <ShareListingButton title={title} />
      {agent && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold">Listed by</h3>
          <Link href={`/agents/${agent.slug}`} className="mt-2 block font-medium text-emerald-600 hover:underline">
            {agent.user?.firstName} {agent.user?.lastName}
          </Link>
          {agent.brokerage && <p className="text-sm text-slate-500">{agent.brokerage.name}</p>}
          {agent.phone && <p className="mt-1 text-sm">{agent.phone}</p>}
        </div>
      )}
      <InquiryForm listingId={listingId} agentUserId={agent?.id} />
      <TourForm listingId={listingId} />
    </div>
  );
}
