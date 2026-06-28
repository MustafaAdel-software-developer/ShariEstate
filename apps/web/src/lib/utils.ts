import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, listingType?: string) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
  return listingType === "rent" ? `${formatted}/mo` : formatted;
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
