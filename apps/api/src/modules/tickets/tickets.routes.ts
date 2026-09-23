import { Router } from 'express'
import { ticketsController } from '../tickets/tickets.controller.js'
import { requireAuth } from '../../middlewares/auth.js'

export const ticketsRoutes = Router()

ticketsRoutes.use(requireAuth)
ticketsRoutes.get('/mine', ticketsController.listMine)
ticketsRoutes.get('/:id/qrcode', ticketsController.getQrCode)