import type { Request, Response } from 'express'
import { eventsService } from './events.service.js'
import { createEventSchema, updateEventSchema } from './events.schema.js'

export const eventsController = {
  async listPublished(_req: Request, res: Response) {
    const events = await eventsService.listPublished()
    res.json({ events })
  },

  async listMine(req: Request, res: Response) {
    const events = await eventsService.listMine(req.user!.userId)
    res.json({ events })
  },

  async getById(req: Request, res: Response) {
    const event = await eventsService.getById(Number(req.params.id))
    res.json({ event })
  },

  async create(req: Request, res: Response) {
    const input = createEventSchema.parse(req.body)
    const event = await eventsService.create(req.user!.userId, input)
    res.status(201).json({ event })
  },

  async update(req: Request, res: Response) {
    const input = updateEventSchema.parse(req.body)
    const event = await eventsService.update(Number(req.params.id), req.user!.userId, input)
    res.json({ event })
  },

  async publish(req: Request, res: Response) {
    const event = await eventsService.publish(Number(req.params.id), req.user!.userId)
    res.json({ event })
  },

  async cancel(req: Request, res: Response) {
    const event = await eventsService.cancel(Number(req.params.id), req.user!.userId)
    res.json({ event })
  },
}