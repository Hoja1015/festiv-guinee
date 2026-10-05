import { Router } from 'express'
import { salesController } from './sales.controller.js'
import { requireAuth, requireRole } from '../../middlewares/auth.js'

export const salesRoutes = Router()

// Ventes de l'organisateur connecté (commandes payées de ses événements).
salesRoutes.get('/mine', requireAuth, requireRole('ORGANIZER'), salesController.mine)