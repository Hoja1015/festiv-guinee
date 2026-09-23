import { Router } from 'express'
import { ordersController } from '../orders/orders.controller.js'
import { requireAuth } from '../middlewares/auth.js'

export const ordersRoutes = Router()

// Toutes les routes de commandes nécessitent d'être connecté (n'importe
// quel rôle peut passer commande — CUSTOMER, mais aussi ORGANIZER ou ADMIN
// s'ils veulent assister à un événement, rien ne l'interdit).
ordersRoutes.use(requireAuth)

ordersRoutes.post('/', ordersController.create)
ordersRoutes.get('/mine', ordersController.listMine)
ordersRoutes.get('/:id', ordersController.getById)