import { z } from 'zod';

export const scheduleTourSchema = z.object({
  listingId: z.string().uuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  preferredDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  preferredTime: z.string().min(1).max(50),
  message: z.string().max(1000).optional(),
});

export type ScheduleTourInput = z.infer<typeof scheduleTourSchema>;
