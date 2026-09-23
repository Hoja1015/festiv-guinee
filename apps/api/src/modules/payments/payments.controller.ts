import type { Request, Response } from 'express'
import { z } from 'zod'
import { paymentsService } from './payments.service.js'

const paySchema = z.object({
  forceFail: z.boolean().optional().default(false),
})

export const paymentsController = {
  async pay(req: Request, res: Response) {
    const { forceFail } = paySchema.parse(req.body ?? {})
    const result = await paymentsService.pay(Number(req.params.orderId), req.user!.userId, forceFail)
    res.json({ payment: result })
  },
}