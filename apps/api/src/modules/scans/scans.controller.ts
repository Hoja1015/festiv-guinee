import type { Request, Response } from 'express'
import { scansService } from '../scans/scans.service.js'
import { createScanSchema } from '../scans/scans.schema.js'

export const scansController = {
  async scan(req: Request, res: Response) {
    const input = createScanSchema.parse(req.body)
    const result = await scansService.scan(req.user!.userId, input.eventId, input.token)
    res.json(result)
  },
}