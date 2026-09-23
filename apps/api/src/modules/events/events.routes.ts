import { Router } from 'express'
import { eventsController } from './events.controller.js'
import { requireAuth, requireRole } from '../../middlewares/auth.js'

export const eventsRoutes = Router()

// Routes publiques — aucune protection
eventsRoutes.get('/', eventsController.listPublished)

// Routes protégées — organisateur uniquement
// IMPORTANT : /mine doit être déclarée AVANT /:id, sinon Express interprète
// "mine" comme une valeur du paramètre :id (route dynamique trop gourmande).
eventsRoutes.get('/mine', requireAuth, requireRole('ORGANIZER'), eventsController.listMine)
eventsRoutes.post('/', requireAuth, requireRole('ORGANIZER'), eventsController.create)
eventsRoutes.patch('/:id', requireAuth, requireRole('ORGANIZER'), eventsController.update)
eventsRoutes.post('/:id/publish', requireAuth, requireRole('ORGANIZER'), eventsController.publish)
eventsRoutes.post('/:id/cancel', requireAuth, requireRole('ORGANIZER'), eventsController.cancel)

// Route publique dynamique — déclarée après /mine pour la raison ci-dessus
eventsRoutes.get('/:id', eventsController.getById)