import { Router } from 'express'
import { uploadsController } from './uploads.controller.js'
import { requireAuth, requireRole } from '../../middlewares/auth.js'

export const uploadsRoutes = Router()

// Seuls les organisateurs envoient des images (événements, publications).
uploadsRoutes.post('/signature', requireAuth, requireRole('ORGANIZER'), uploadsController.signature)