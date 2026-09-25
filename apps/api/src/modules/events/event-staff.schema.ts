import { z } from 'zod'

export const assignStaffSchema = z.object({
  userId: z.number().int().positive(),
})

export type AssignStaffInput = z.infer<typeof assignStaffSchema>