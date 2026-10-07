import type { Request, Response } from 'express'
import { teamService } from './team.service.js'
import { assignStaffSchema } from './team.schema.js'
import { ValidationError } from '../../shared/errors.js'

function parseId(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('Identifiant invalide')
  }
  return id
}

export const teamController = {
  async mine(req: Request, res: Response) {
    res.json(await teamService.getMine(req.user!.userId))
  },

  async assign(req: Request, res: Response) {
    const input = assignStaffSchema.parse(req.body)
    const staff = await teamService.assign(req.user!.userId, input)
    res.status(201).json({ staff })
  },

  async unassign(req: Request, res: Response) {
    await teamService.unassign(req.user!.userId, parseId(req.params.assignmentId))
    res.status(204).send()
  },
}