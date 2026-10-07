import type { Request, Response } from 'express'
import { ticketTypesService } from './ticket-types.service.js'
import { createTicketTypeSchema, updateTicketTypeSchema } from './ticket-types.schema.js'
import { ValidationError } from '../../shared/errors.js'

function parseId(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('Identifiant invalide')
  }
  return id
}

export const ticketTypesController = {
  async listByEvent(req: Request, res: Response) {
    const ticketTypes = await ticketTypesService.listByEvent(parseId(req.params.eventId))
    res.json({ ticketTypes })
  },

  async create(req: Request, res: Response) {
    const input = createTicketTypeSchema.parse(req.body)
    const ticketType = await ticketTypesService.create(
      parseId(req.params.eventId),
      req.user!.userId,
      input
    )
    res.status(201).json({ ticketType })
  },

  async update(req: Request, res: Response) {
    const input = updateTicketTypeSchema.parse(req.body)
    const ticketType = await ticketTypesService.update(
      parseId(req.params.id),
      parseId(req.params.eventId),
      req.user!.userId,
      input
    )
    res.json({ ticketType })
  },
}