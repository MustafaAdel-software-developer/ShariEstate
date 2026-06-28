import type { PaginatedResponse, Listing } from "@real-estate/shared";

export const EMPTY_SEARCH: PaginatedResponse<Listing> = {
  data: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

/** Ensure listing props are safe to pass from Server → Client components. */
export function sanitizeListings(result: PaginatedResponse<Listing>): PaginatedResponse<Listing> {
  return {
    ...result,
    data: result.data.map((listing) => ({
      ...listing,
      price: Number(listing.price),
      baths: Number(listing.baths),
      lat: listing.lat != null ? Number(listing.lat) : listing.lat,
      lng: listing.lng != null ? Number(listing.lng) : listing.lng,
    })),
  };
}
