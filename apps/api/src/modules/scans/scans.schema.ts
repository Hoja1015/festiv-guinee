import { z } from 'zod'

export const createScanSchema = z.object({
  eventId: z.number().int().positive(),
  token: z.string().min(1, 'Le token scanné est requis'),
})

export type CreateScanInput = z.infer<typeof createScanSchema>