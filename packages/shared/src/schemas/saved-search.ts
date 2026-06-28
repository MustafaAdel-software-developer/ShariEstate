import { z } from 'zod';

const listingTypeEnum = z.enum(['sale', 'rent']);
const propertyTypeEnum = z.enum(['house', 'condo', 'townhouse', 'land', 'commercial']);

export const savedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  stateSlug: z.string().optional(),
  citySlug: z.string().optional(),
  neighborhoodSlug: z.string().optional(),
  listingType: listingTypeEnum.optional(),
  propertyType: propertyTypeEnum.optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  beds: z.number().int().optional(),
  baths: z.number().optional(),
  keywords: z.string().optional(),
  emailAlerts: z.boolean().default(true),
});

export type SavedSearchInput = z.infer<typeof savedSearchSchema>;
