"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  alt?: string | null;
}

interface ListingGalleryProps {
  images: GalleryImage[];
  title: string;
  intervalMs?: number;
}

export function ListingGallery({ images, title, intervalMs = 4000 }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = images.length;
  const active = images[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActiveIndex(((index % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(next, intervalMs);
    return () => clearInterval(timer);
  }, [count, paused, next, intervalMs]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        No photos
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="group relative overflow-hidden rounded-xl bg-slate-100">
        <div className="relative aspect-[16/10]">
          <Image
            key={active.id}
            src={active.url}
            alt={active.alt || title}
            fill
            className="object-cover transition-opacity duration-500"
            sizes="(max-width:1024px) 100vw, 66vw"
            priority={activeIndex === 0}
          />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow opacity-0 transition hover:bg-white group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow opacity-0 transition hover:bg-white group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  aria-label={`Go to photo ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === activeIndex ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80",
                  )}
                />
              ))}
            </div>
            <span className="absolute right-3 top-3 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white">
              {activeIndex + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg ring-2 ring-offset-2 transition",
                i === activeIndex ? "ring-emerald-600" : "ring-transparent hover:ring-slate-300",
              )}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
