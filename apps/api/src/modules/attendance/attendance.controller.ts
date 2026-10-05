import type { Request, Response } from 'express'
import { attendanceService } from './attendance.service.js'

export const attendanceController = {
  async mine(req: Request, res: Response) {
    const result = await attendanceService.getMine(req.user!.userId)
    res.json(result)
  },
}