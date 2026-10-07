import type { Request, Response } from 'express'
import { eventsService } from './events.service.js'
import { createEventSchema, updateEventSchema } from './events.schema.js'
import { assignStaffSchema } from './event-staff.schema.js'
import { ValidationError } from '../../shared/errors.js'

// Un identifiant d'URL doit être un entier strictement positif : sinon
// `Number('abc')` donnerait NaN et la requête partirait en base.
function parseId(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('Identifiant invalide')
  }
  return id
}

const MAX_HIGHLIGHTS = 20

export const eventsController = {
  async listPublished(_req: Request, res: Response) {
    const events = await eventsService.listPublished()
    res.json({ events })
  },

  async listPastHighlights(req: Request, res: Response) {
    const limitParam = req.query.limit
    const parsed = typeof limitParam === 'string' ? Number(limitParam) : 6
    // Borné pour qu'un visiteur ne puisse pas demander des milliers de lignes.
    const limit = Number.isFinite(parsed) ? Math.min(Math.max(Math.trunc(parsed), 1), MAX_HIGHLIGHTS) : 6
    const events = await eventsService.listPastHighlights(limit)
    res.json({ events })
  },

  async listMine(req: Request, res: Response) {
    const events = await eventsService.listMine(req.user!.userId)
    res.json({ events })
  },

  async getById(req: Request, res: Response) {
    const event = await eventsService.getById(parseId(req.params.id))
    res.json({ event })
  },

  async create(req: Request, res: Response) {
    const input = createEventSchema.parse(req.body)
    const event = await eventsService.create(req.user!.userId, input)
    res.status(201).json({ event })
  },

  async update(req: Request, res: Response) {
    const input = updateEventSchema.parse(req.body)
    const event = await eventsService.update(parseId(req.params.id), req.user!.userId, input)
    res.json({ event })
  },

  async publish(req: Request, res: Response) {
    const event = await eventsService.publish(parseId(req.params.id), req.user!.userId)
    res.json({ event })
  },

  async cancel(req: Request, res: Response) {
    const event = await eventsService.cancel(parseId(req.params.id), req.user!.userId)
    res.json({ event })
  },

  async assignStaff(req: Request, res: Response) {
    const input = assignStaffSchema.parse(req.body)
    const assignment = await eventsService.assignStaff(
      parseId(req.params.id),
      req.user!.userId,
      input.userId
    )
    res.status(201).json({ assignment })
  },

  async listStaff(req: Request, res: Response) {
    const eventId = parseId(req.params.id)
    // Seul l'organisateur de l'événement peut voir son équipe.
    await eventsService.assertOwnership(eventId, req.user!.userId)
    const staff = await eventsService.listStaff(eventId)
    res.json({ staff })
  },

  async listParticipants(req: Request, res: Response) {
    const participants = await eventsService.listParticipants(
      parseId(req.params.id),
      req.user!.userId
    )
    res.json({ participants })
  },
}