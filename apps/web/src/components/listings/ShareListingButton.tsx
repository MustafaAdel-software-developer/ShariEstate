"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

interface Props {
  title: string;
}

export function ShareListingButton({ title }: Props) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // fall through to copy
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={share}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
    >
      <Share2 className="h-4 w-4" />
      {copied ? "Link copied!" : "Share listing"}
    </button>
  );
}
