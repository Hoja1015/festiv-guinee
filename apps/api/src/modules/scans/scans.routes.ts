import { Router } from 'express'
import { scansController } from './scans.controller.js'
import { requireAuth, requireRole } from '../../middlewares/auth.js'

export const scansRoutes = Router()

// STAFF et ADMIN peuvent scanner (un admin peut vouloir tester/superviser).
scansRoutes.post('/', requireAuth, requireRole('STAFF', 'ADMIN'), scansController.scan)