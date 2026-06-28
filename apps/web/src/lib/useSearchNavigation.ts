"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function useSearchNavigation(stateSlug: string, basePath?: string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const path = basePath || `/states/${stateSlug}/search`;

  const pushParams = (params: URLSearchParams) => {
    startTransition(() => {
      router.push(`${path}?${params.toString()}`);
    });
  };

  return { isPending, pushParams };
}
