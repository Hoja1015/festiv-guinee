import { z } from 'zod'

export const createTicketTypeSchema = z.object({
  name: z.enum(['STANDARD', 'VIP', 'VVIP']),
  description: z.string().optional(),
  priceGNF: z.number().int().positive('Le prix doit être un nombre entier positif'),
  totalQuantity: z.number().int().positive('La quantité doit être un nombre entier positif'),
})

export const updateTicketTypeSchema = createTicketTypeSchema.partial()

export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>