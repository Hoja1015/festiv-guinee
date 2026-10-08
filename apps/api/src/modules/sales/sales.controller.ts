import type { Request, Response } from 'express'
import { salesService } from './sales.service.js'
import { parsePagination } from '../../shared/pagination.js'

export const salesController = {
  async mine(req: Request, res: Response) {
    const result = await salesService.getMine(req.user!.userId)
    res.json(result)
  },

  // Commandes payées paginées : ?page=, ?pageSize= (20 par défaut, 100 max)
  async orders(req: Request, res: Response) {
    const page = parsePagination(req.query as Record<string, unknown>, {
      defaultPageSize: 20,
      maxPageSize: 100,
    })
    const result = await salesService.listOrders(req.user!.userId, page)
    res.json(result)
  },
}