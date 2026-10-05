import { Router } from 'express'
import { attendanceController } from './attendance.controller.js'
import { requireAuth, requireRole } from '../../middlewares/auth.js'

export const attendanceRoutes = Router()

// Fréquentation et historique des scans des événements de l'organisateur.
attendanceRoutes.get('/mine', requireAuth, requireRole('ORGANIZER'), attendanceController.mine)