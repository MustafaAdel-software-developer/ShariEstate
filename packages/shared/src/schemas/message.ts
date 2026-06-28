import { z } from 'zod';

export const sendMessageSchema = z.object({
  listingId: z.string().uuid(),
  recipientId: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
