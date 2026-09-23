import { Router } from 'express'
import { paymentsController } from './payments.controller'
import { requireAuth } from '../../middlewares/auth.js'

export const paymentsRoutes = Router({ mergeParams: true })

paymentsRoutes.use(requireAuth)
paymentsRoutes.post('/', paymentsController.pay)