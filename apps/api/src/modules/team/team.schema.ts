import { z } from 'zod'

export const assignStaffSchema = z.object({
  eventId: z.number().int().positive(),
  email: z.string().trim().toLowerCase().email('Adresse email invalide'),
})

export type AssignStaffInput = z.infer<typeof assignStaffSchema>