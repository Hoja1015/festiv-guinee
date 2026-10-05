import type { Request, Response } from 'express'
import { salesService } from './sales.service.js'

export const salesController = {
  async mine(req: Request, res: Response) {
    const result = await salesService.getMine(req.user!.userId)
    res.json(result)
  },
}