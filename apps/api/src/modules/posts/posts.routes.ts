import { Router } from 'express'
import { postsController } from './posts.controller.js'
import { requireAuth, requireRole } from '../../middlewares/auth.js'
import { optionalAuth } from '../../middlewares/optional-auth.js'

export const postsRoutes = Router()

// Lecture publique. `optionalAuth` identifie le visiteur s'il est connecté
// (pour savoir s'il a déjà liké) sans bloquer les anonymes.
postsRoutes.get('/', optionalAuth, postsController.list)
postsRoutes.get('/:id', optionalAuth, postsController.getById)
postsRoutes.get('/:id/comments', postsController.listComments)

// Publier / modifier / supprimer une publication : organisateurs uniquement.
postsRoutes.post('/', requireAuth, requireRole('ORGANIZER'), postsController.create)
postsRoutes.patch('/:id', requireAuth, requireRole('ORGANIZER'), postsController.update)
postsRoutes.delete('/:id', requireAuth, requireRole('ORGANIZER'), postsController.remove)

// Réagir : n'importe quel utilisateur connecté.
postsRoutes.post('/:id/like', requireAuth, postsController.like)
postsRoutes.delete('/:id/like', requireAuth, postsController.unlike)
postsRoutes.post('/:id/comments', requireAuth, postsController.addComment)
postsRoutes.delete('/:id/comments/:commentId', requireAuth, postsController.removeComment)