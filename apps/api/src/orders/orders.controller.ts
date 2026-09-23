import type { Request, Response } from 'express'
import { ordersService } from '../orders/orders.service.js'
import { createOrderSchema } from '../orders/orders.schema.js'

export const ordersController = {
  async create(req: Request, res: Response) {
    const input = createOrderSchema.parse(req.body)
    const order = await ordersService.create(req.user!.userId, input)
    res.status(201).json({ order })
  },

  async listMine(req: Request, res: Response) {
    const orders = await ordersService.listMine(req.user!.userId)
    res.json({ orders })
  },

  async getById(req: Request, res: Response) {
    const order = await ordersService.getById(Number(req.params.id), req.user!.userId)
    res.json({ order })
  },
}