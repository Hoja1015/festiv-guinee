import { Router } from 'express'
import { ticketTypesController } from './ticket-types.controller.js'
import { requireAuth, requireRole } from '../../middlewares/auth.js'

// mergeParams: true est indispensable ici — ce router va être monté sous
// /events/:eventId/ticket-types, et sans cette option, il ne pourrait pas
// lire req.params.eventId (chaque Router Express a ses propres params
// par défaut, isolés de son parent).
export const ticketTypesRoutes = Router({ mergeParams: true })

ticketTypesRoutes.get('/', ticketTypesController.listByEvent)
ticketTypesRoutes.post('/', requireAuth, requireRole('ORGANIZER'), ticketTypesController.create)
ticketTypesRoutes.patch('/:id', requireAuth, requireRole('ORGANIZER'), ticketTypesController.update)