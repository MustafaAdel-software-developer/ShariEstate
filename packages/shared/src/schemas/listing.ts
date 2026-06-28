import { z } from 'zod';

const listingTypeEnum = z.enum(['sale', 'rent']);
const propertyTypeEnum = z.enum(['house', 'condo', 'townhouse', 'land', 'commercial']);
const listingStatusEnum = z.enum(['draft', 'pending', 'active', 'sold', 'rented', 'off_market']);
const listingSourceEnum = z.enum(['manual', 'mls']);

export const createListingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(10000),
  listingType: listingTypeEnum,
  propertyType: propertyTypeEnum,
  price: z.number().positive(),
  beds: z.number().int().min(0).max(50),
  baths: z.number().min(0).max(50),
  sqft: z.number().int().positive().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear() + 2).optional(),
  address: z.string().min(5).max(300),
  zip: z.string().min(5).max(10),
  stateId: z.string().uuid(),
  cityId: z.string().uuid(),
  neighborhoodId: z.string().uuid().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  features: z.array(z.string()).optional(),
  source: listingSourceEnum.default('manual'),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: listingStatusEnum.optional(),
  isFeatured: z.boolean().optional(),
});

export const listingSearchSchema = z.object({
  state: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  listingType: listingTypeEnum.optional(),
  propertyType: propertyTypeEnum.optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  beds: z.coerce.number().int().optional(),
  baths: z.coerce.number().optional(),
  minSqft: z.coerce.number().int().optional(),
  maxSqft: z.coerce.number().int().optional(),
  keywords: z.string().optional(),
  status: listingStatusEnum.optional(),
  isFeatured: z.coerce.boolean().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'sqft_desc']).default('newest'),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingSearchInput = z.infer<typeof listingSearchSchema>;
