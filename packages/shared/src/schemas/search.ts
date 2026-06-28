import { z } from 'zod';
import { listingSearchSchema } from './listing';

export { listingSearchSchema as searchSchema };
export type SearchParams = z.infer<typeof listingSearchSchema>;
