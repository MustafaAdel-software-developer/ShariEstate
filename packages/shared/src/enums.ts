export const UserRole = {
  BUYER: 'buyer',
  AGENT: 'agent',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ListingType = {
  SALE: 'sale',
  RENT: 'rent',
} as const;

export type ListingType = (typeof ListingType)[keyof typeof ListingType];

export const PropertyType = {
  HOUSE: 'house',
  CONDO: 'condo',
  TOWNHOUSE: 'townhouse',
  LAND: 'land',
  COMMERCIAL: 'commercial',
} as const;

export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const ListingStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ACTIVE: 'active',
  SOLD: 'sold',
  RENTED: 'rented',
  OFF_MARKET: 'off_market',
} as const;

export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];

export const ListingSource = {
  MANUAL: 'manual',
  MLS: 'mls',
} as const;

export type ListingSource = (typeof ListingSource)[keyof typeof ListingSource];

export const InquiryStatus = {
  NEW: 'new',
  CONTACTED: 'contacted',
  CLOSED: 'closed',
} as const;

export type InquiryStatus = (typeof InquiryStatus)[keyof typeof InquiryStatus];

export const TourStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type TourStatus = (typeof TourStatus)[keyof typeof TourStatus];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: 'House',
  condo: 'Condo',
  townhouse: 'Townhouse',
  land: 'Land',
  commercial: 'Commercial',
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sale: 'For Sale',
  rent: 'For Rent',
};
