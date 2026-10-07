import { Router } from 'express'
import { teamController } from './team.controller.js'
import { requireAuth, requireRole } from '../../middlewares/auth.js'

export const teamRoutes = Router()

// Gestion des agents de contrôle : organisateurs uniquement, sur leurs événements.
teamRoutes.get('/mine', requireAuth, requireRole('ORGANIZER'), teamController.mine)
teamRoutes.post('/', requireAuth, requireRole('ORGANIZER'), teamController.assign)
teamRoutes.delete('/:assignmentId', requireAuth, requireRole('ORGANIZER'), teamController.unassign)