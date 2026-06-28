export interface SavedSearchRecord {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  emailAlerts?: boolean;
}

export function buildSavedSearchUrl(stateSlug: string, filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  const state = (filters.stateSlug as string) || stateSlug;

  if (filters.citySlug) params.set("city", String(filters.citySlug));
  if (filters.neighborhoodSlug) params.set("neighborhood", String(filters.neighborhoodSlug));
  if (filters.listingType) params.set("listingType", String(filters.listingType));
  if (filters.propertyType) params.set("propertyType", String(filters.propertyType));
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.beds != null) params.set("beds", String(filters.beds));
  if (filters.baths != null) params.set("baths", String(filters.baths));
  if (filters.keywords) params.set("keywords", String(filters.keywords));

  const qs = params.toString();
  return `/states/${state}/search${qs ? `?${qs}` : ""}`;
}
