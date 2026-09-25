import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { errorHandler } from '../src/middlewares/error-handler.js'
import { authRoutes } from '../src/modules/auth/auth.routes.js'
import { eventsRoutes } from '../src/modules/events/events.routes.js'
import { ticketTypesRoutes } from '../src/modules/ticket-types/ticket-types.routes.js'
import { ordersRoutes } from '../src/orders/orders.routes.js'
import { paymentsRoutes } from '../src/modules/payments/payments.routes.js'
import { ticketsRoutes } from '../src/modules/tickets/tickets.routes.js'
import { scansRoutes } from '../src/modules/scans/scans.routes.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: process.env.WEB_URL || 'http://localhost:5173',
      credentials: true,
    })
  )
  app.use(express.json())
  app.use(cookieParser())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/auth', authRoutes)
  app.use('/events', eventsRoutes)
  app.use('/events/:eventId/ticket-types', ticketTypesRoutes)
  app.use('/orders', ordersRoutes)
  app.use('/orders/:orderId/pay', paymentsRoutes)
  app.use('/tickets', ticketsRoutes)
  app.use('/scans', scansRoutes)

  app.use(errorHandler)

  return app
}