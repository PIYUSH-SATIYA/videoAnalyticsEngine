import { z } from 'zod';

export const reportKeySchema = z.object({
  reportKey: z.string().min(1)
});

export const listReportsSchema = z.object({}).passthrough();
