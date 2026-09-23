import type { Request, Response } from 'express'
import { ticketTypesService } from './ticket-types.service.js'
import { createTicketTypeSchema, updateTicketTypeSchema } from './ticket-types.schema.js'

export const ticketTypesController = {
  async listByEvent(req: Request, res: Response) {
    const ticketTypes = await ticketTypesService.listByEvent(Number(req.params.eventId))
    res.json({ ticketTypes })
  },

  async create(req: Request, res: Response) {
    const input = createTicketTypeSchema.parse(req.body)
    const ticketType = await ticketTypesService.create(
      Number(req.params.eventId),
      req.user!.userId,
      input
    )
    res.status(201).json({ ticketType })
  },

  async update(req: Request, res: Response) {
    const input = updateTicketTypeSchema.parse(req.body)
    const ticketType = await ticketTypesService.update(
      Number(req.params.id),
      Number(req.params.eventId),
      req.user!.userId,
      input
    )
    res.json({ ticketType })
  },
}