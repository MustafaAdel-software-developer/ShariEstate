import { z } from 'zod';

export const createStateSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  abbreviation: z.string().length(2),
  heroTitle: z.string().max(200).optional(),
  heroSubtitle: z.string().max(500).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  enabled: z.boolean().default(false),
});

export const createCitySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  stateId: z.string().uuid(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
});

export type CreateStateInput = z.infer<typeof createStateSchema>;
export type CreateCityInput = z.infer<typeof createCitySchema>;
