import { z } from 'zod';

export const createInquirySchema = z.object({
  listingId: z.string().uuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  message: z.string().min(10).max(2000),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
