import { Router } from 'express'
import { eventsController } from './events.controller.js'
import { requireAuth, requireRole } from '../../middlewares/auth.js'

export const eventsRoutes = Router()

eventsRoutes.get('/', eventsController.listPublished)

eventsRoutes.get('/mine', requireAuth, requireRole('ORGANIZER'), eventsController.listMine)
eventsRoutes.post('/', requireAuth, requireRole('ORGANIZER'), eventsController.create)
eventsRoutes.patch('/:id', requireAuth, requireRole('ORGANIZER'), eventsController.update)
eventsRoutes.post('/:id/publish', requireAuth, requireRole('ORGANIZER'), eventsController.publish)
eventsRoutes.post('/:id/cancel', requireAuth, requireRole('ORGANIZER'), eventsController.cancel)
eventsRoutes.post('/:id/staff', requireAuth, requireRole('ORGANIZER'), eventsController.assignStaff)
eventsRoutes.get('/:id/staff', requireAuth, requireRole('ORGANIZER'), eventsController.listStaff)

eventsRoutes.get('/:id', eventsController.getById)