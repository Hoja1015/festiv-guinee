import { z } from 'zod'

const orderItemInputSchema = z.object({
  ticketTypeId: z.number().int().positive(),
  quantity: z.number().int().positive().max(10, 'Maximum 10 billets par type et par commande'),
})

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'La commande doit contenir au moins un billet'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>